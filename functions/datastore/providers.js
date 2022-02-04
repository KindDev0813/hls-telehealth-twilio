/*
 * --------------------------------------------------------------------------------
 * manage providers including storage to EHR
 *
 * event parameters:
 * .action: USAGE|SCHEMA|PROTOTYPE|GET, default USAGE
 * --------------------------------------------------------------------------------
 */

const SCHEMA = '/datastore/provider-schema.json';
const PROTOTYPE = '/datastore/provider-prototype.json';
const FHIR_PRACTITIONER = 'Practitioners';
const FHIR_PRACTITIONER_ROLE = 'PractitionerRoles';

const assert = require("assert");
const { getParam } = require(Runtime.getFunctions()['helpers'].path);
const { read_fhir, save_fhir, fetchPublicJsonAsset } = require(Runtime.getFunctions()['datastore/datastore-helpers'].path);

// --------------------------------------------------------------------------------
function transform_fhir_to_provider(fhir_practitioner, fhir_practitioner_roles) {
  const r = fhir_practitioner;

  const pid = 'Practitioner/' + r.id;
  const provider = {
    provider_id: r.id,
    provider_name: r.name[0].text,
    provider_phone: r.telecom[0].value,
    provider_on_call: fhir_practitioner_roles.some(e => e.practitioner.reference === pid),
  };
  return provider;
}


// --------------------------------------------------------------------------------
async function getAll(context) {
  const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');

  let resources = await read_fhir(context, TWILIO_SYNC_SID, FHIR_PRACTITIONER);
  const practitioner_roles = await read_fhir(context, TWILIO_SYNC_SID, FHIR_PRACTITIONER_ROLE);

  const providers = resources.map(r => transform_fhir_to_provider(r, practitioner_roles));

  return providers;
}
exports.getAll = getAll;


// --------------------------------------------------------------------------------
exports.handler = async function(context, event, callback) {
  const THIS = 'providers:';
  console.time(THIS);

  const { getParam } = require(Runtime.getFunctions()['helpers'].path);
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

    switch (action) {

      case 'USAGE': {
        const usage = {
          action: 'usage for providers function',
          USAGE: {
            description: 'returns function signature, default action',
            parameters: {},
          },
          SCHEMA: {
            description: 'returns json schema for provider in telehealth',
            parameters: {},
          },
          PROTOTYPE: {
            description: 'returns prototype of provider in telehealth',
            parameters: {},
          },
          GET: {
            description: 'returns array of providers',
            parameters: {
              provider_id: 'optional, filters for specified provider. will return zero or one',
            },
          },
          GETONCALL: {
            description: 'returns array of one provider provider_on_call = true',
            parameters: {},
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

        const providers = event.provider_id ? all.filter(p => p.provider_id === event.provider_id) : all;

        console.log(THIS, `retrieved ${providers.length} providers`);
        const response = new Twilio.Response();
        response.setStatusCode(200);
        response.appendHeader('Content-Type', 'application/json');
        response.setBody(providers);
        if (context.DOMAIN_NAME.startsWith('localhost:')) {
          response.appendHeader('Access-Control-Allow-Origin', '*');
          response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
          response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
        }
        return callback(null, response);
      }

      case 'GETONCALL': {
        const all = await getAll(context);

        const providers = all.filter(p => p.provider_on_call === true);

        console.log(THIS, `retrieved ${providers.length} providers`);
        const response = new Twilio.Response();
        response.setStatusCode(200);
        response.appendHeader('Content-Type', 'application/json');
        response.setBody(providers);
        if (context.DOMAIN_NAME.startsWith('localhost:')) {
          response.appendHeader('Access-Control-Allow-Origin', '*');
          response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
          response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
        }
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
};
