/*
 * --------------------------------------------------------------------------------
 * manage waiting room contents including storage to EHR/CMS
 *
 * event parameters:
 * .action: USAGE|SCHEMA|PROTOTYPE|GET|ADD|REMOVE|ASSIGN|UNASSIGN, default USAGE
 * --------------------------------------------------------------------------------
 */

const SCHEMA = '/datastore/content-schema.json';
const PROTOTYPE = '/datastore/content-prototype.json';
const FHIR_DOCUMENT_REFERENCE = 'DocumentReferences';
const FHIR_APPOINTMENT = 'Appointments';

const assert = require("assert");
const { getParam } = require(Runtime.getFunctions()['helpers'].path);
const { read_fhir, save_fhir, fetchPublicJsonAsset } = require(Runtime.getFunctions()['datastore/datastore-helpers'].path);

// --------------------------------------------------------------------------------
function transform_fhir_to_content(fhir_document_reference) {
  const r = fhir_document_reference;
  const content = {
    content_id: r.id,
    content_title: r.content[0].attachment.title,
    ...(r.description && { content_description: r.description }),
    content_video_url: r.content[0].attachment.url,
    providers: r.context.related.map(e => e.reference.replace('Practitioner/', '')),
  };
  return content;
}

// --------------------------------------------------------------------------------
function transform_content_to_fhir(content) {
  const c = content;
  const related = c.providers
    ? c.providers.map(e => { return { reference: 'Practitioner/' + e, }})
    : [];
  const fhir_document_reference = {
    resourceType: 'DocumentReference',
    id: c.content_id,
    status: 'current',
    description: c.content_description,
    content: [
      {
        attachment: {
          url: c.content_video_url,
          title: c.content_title,
        }
      }
    ],
    context: {
      related: related
    }
  };
  return fhir_document_reference;
}


// --------------------------------------------------------------------------------
async function getAll(context) {
  const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');
  let resources = await read_fhir(context, TWILIO_SYNC_SID, FHIR_DOCUMENT_REFERENCE);

  const contents = resources.map(r => transform_fhir_to_content(r));

  return contents;
}
exports.getAll = getAll;


// --------------------------------------------------------------------------------
exports.handler = async function(context, event, callback) {
  const THIS = 'contents:';
  console.time(THIS);

  const { isValidAppToken } = require(Runtime.getFunctions()["authentication-helper"].path);

  try {
    /* Following code checks that a valid token was sent with the API call */
    assert(event.token);
    if (!isValidAppToken(event.token, context)) {
      const response = new Twilio.Response();
      response.appendHeader('Content-Type', 'application/json');
      response.setStatusCode(401);
      response.setBody({message: 'Invalid or expired token'});
      return callback(null, response);
    }

    const action = event.action ? event.action : 'USAGE'; // default action
    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'application/json');
    if (context.DOMAIN_NAME.startsWith('localhost:')) {
      response.appendHeader('Access-Control-Allow-Origin', '*');
      response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
      response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    switch (action) {

      case 'USAGE': {
        // json prototype for ADD
        const prototype = await fetchPublicJsonAsset(context, PROTOTYPE);
        delete prototype.content_id;
        delete prototype.providers;

        const usage = {
          action: 'usage for contents function',
          USAGE: {
            description: 'returns function signature, default action',
            parameters: {},
          },
          SCHEMA: {
            description: 'returns json schema for content in telehealth',
            parameters: {},
          },
          PROTOTYPE: {
            description: 'returns prototype of content in telehealth',
            parameters: {},
          },
          GET: {
            description: 'returns array of content',
            parameters: {
              content_id: 'optional, filters for specified content_id. will return zero or one',
              provider_id: 'optional, filters for specified provider_id',
            }
          },
          ADD: {
            description: 'add a new content',
            parameters: {
              content: prototype,
            },
          },
          REMOVE: {
            description: 'remove an existing content',
            parameters: {
              content_id: 'required, content_id to remove'
            },
          },
          ASSIGN: {
            description: 'assign content to a provider, unassigning any previous content',
            parameters: {
              content_id: 'required, content_id to assign provider',
              provider_id: 'required, provider to assign content to'
            },
          },
        };
        return callback(null, usage);
      }

      case 'SCHEMA': {
        const schema = await fetchPublicJsonAsset(context, SCHEMA);
        return callback(null, schema);
      }

      case 'PROTOTYPE': {
        const prototype = await fetchPublicJsonAsset(context, PROTOTYPE);
        return callback(null, prototype);
      }

      case 'GET': {
        const all = await getAll(context);

        let contents = all;
        contents = event.content_id ? contents.filter(c => c.content_id === event.content_id) : contents;
        contents = event.provider_id ? contents.filter(c => c.providers.find(p => p === event.provider_id)) : contents;

        console.log(THIS, `retrieved ${contents.length} contents`);
        response.setStatusCode(200);
        response.setBody(contents);
        return callback(null, response);
      }

      case 'ADD': {
        assert(event.content, 'Mssing event.content!!!');
        const content = JSON.parse(event.content);
        assert(content.content_title, 'Mssing content_title!!!');
        assert(content.content_video_url, 'Mssing content_video_url!!!');
        const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');

        const now = new Date();
        content.content_id = 'c' + (now.getTime());

        const fhir_document_reference = transform_content_to_fhir(content);

        const resources = await read_fhir(context, TWILIO_SYNC_SID, FHIR_DOCUMENT_REFERENCE);
        resources.push(fhir_document_reference);

        await save_fhir(context, TWILIO_SYNC_SID, FHIR_DOCUMENT_REFERENCE, resources);

        console.log(THIS, `added content ${content.content_id}`);
        return callback(null, { content_id : content.content_id });
      }

      case 'REMOVE': {
        assert(event.content_id, 'Missing event.content_id!!!');
        const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');

        const resources = await read_fhir(context, TWILIO_SYNC_SID, FHIR_DOCUMENT_REFERENCE);
        const remainder = resources.filter(r => r.id !== event.content_id);
        await save_fhir(context, TWILIO_SYNC_SID, FHIR_DOCUMENT_REFERENCE, remainder);

        console.log(THIS, `removed content ${event.content_id}`);
        return callback(null, { content_id : event.content_id });
      }

      case 'ASSIGN': {
        assert(event.content_id, 'Mssing event.content_id!!!');
        assert(event.provider_id, 'Mssing event.provider_id!!!');
        const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');

        const resources = await read_fhir(context, TWILIO_SYNC_SID, FHIR_DOCUMENT_REFERENCE);

        const pid = 'Practitioner/' + event.provider_id;
        {
          // ---------- remove previous assignment if any
          // find index of content assigned provider_id
          const i = resources.findIndex(r => r.context.related.find(e => e.reference === pid));
          if (i > -1) {
            // find index of providers in content
            const j = resources[i].context.related.findIndex(e => e.reference === pid);
            resources[i].context.related.splice(j, 1);
          }
        }

        {
          // ---------- assign
          // find index of content_id
          const c = resources.findIndex(r => r.id === event.content_id);
          assert(c > -1, `Unable to find content: ${event.content_id}`);
          resources[c].context.related.push({reference: pid});
        }

        await save_fhir(context, TWILIO_SYNC_SID, FHIR_DOCUMENT_REFERENCE, resources);

        console.log(THIS, `assigned content ${event.content_id} provider ${event.provider_id}`);
        response.setStatusCode(200);
        response.setBody({
          content_id : event.content_id,
          provider_id: event.provider_id,
        });
        return callback(null, response);
      }

      default: // unknown action
        throw Error(`Unknown action: ${action}!!!`);
    }

  } catch (err) {
    console.log(THIS, err);
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
}

