/* --------------------------------------------------------------------------------
 * common helper function used by functions
 *
 * behavior depends on deployment status of the service
 *
 * getParam(context, key)
 * setParam(context, key, value) - when running on localhost, sets variable on deployed service
 *
 * include via:
 *   const { getParam, setParam } = require(Runtime.getFunctions()['helper'].path);
 *
 * --------------------------------------------------------------------------------
 */
const assert = require("assert");
const path = require("path");
const fs = require("fs");

const SERVER_START_TIMESTAMP = new Date().toISOString().replace(/.\d+Z$/g, "Z");

/* --------------------------------------------------------------------------------
 * assert executing on localhost
 * --------------------------------------------------------------------------------
 */
function assertLocalhost(context) {
  assert(context.DOMAIN_NAME.startsWith('localhost:'), `Can only run on localhost!!!`);
  assert(process.env.ACCOUNT_SID, 'ACCOUNT_SID not set in localhost environment!!!');
  assert(process.env.AUTH_TOKEN, 'AUTH_TOKEN not set in localhost environment!!!');
}


/* --------------------------------------------------------------------------------
 * sets environment variable on deployed service, does nothing on localhost
 * --------------------------------------------------------------------------------
 */
async function setParam(context, key, value) {
  const service_sid = await getParam(context, 'SERVICE_SID');
  if (! service_sid) return null; // do nothing is service is not deployed
  const environment_sid = await getParam(context, 'ENVIRONMENT_SID');

  const client = context.getTwilioClient();

  const variables = await client.serverless
    .services(service_sid)
    .environments(environment_sid)
    .variables.list();
  let variable = variables.find(v => v.key === key);

  if (variable) {
    // update existing variable
    await client.serverless
      .services(service_sid)
      .environments(environment_sid)
      .variables(variable.sid)
      .update({ value })
      .then((v) => console.log('setParam: updated variable', v.key));
  } else {
    // create new variable
    await client.serverless
      .services(service_sid)
      .environments(environment_sid)
      .variables.create({ key, value })
      .then((v) => console.log('setParam: created variable', v.key));
  }
  return {
    key: key,
    value: value
  };
}

/* --------------------------------------------------------------------------------
 * retrieve environment variable value
 *
 * parameters:
 * - context: Twilio Runtime context
 *
 * returns
 * - value of specified environment variable. Note that SERVICE_SID & ENVIRONMENT_SID will return 'null' if not yet deployed
 * --------------------------------------------------------------------------------
 */
async function getParam(context, key) {
  const assert = require('assert');

  assert(context.APPLICATION_NAME, 'undefined .env environment variable APPLICATION_NAME!!!');

  if (key !== 'SERVICE_SID' // avoid warning
    && key !== 'ENVIRONMENT_SID' // avoid warning
    && context[key]) {
    return context[key]; // first return context non-null context value
  }

  const client = context.getTwilioClient();
  try {
    switch (key) {

      case 'SERVICE_SID':
      {
        // return sid only if deployed; otherwise null
        const services = await client.serverless.services.list();
        const service = services.find(s => s.uniqueName === context.APPLICATION_NAME);

        return service ? service.sid : null;
      }

      case 'APPLICATION_VERSION':
      {
        const service_sid = await getParam(context, 'SERVICE_SID');
        if (service_sid === null) return null; // service not yet deployed, therefore return 'null'

        const environment_sid = await getParam(context, 'ENVIRONMENT_SID');
        const variables = await client.serverless
          .services(service_sid)
          .environments(environment_sid)
          .variables.list();
        const variable = variables.find(v => v.key === 'APPLICATION_VERSION');

        return variable ? variable.value : null;
      }

      case 'ENVIRONMENT_SID':
      {
        // return sid only if deployed; otherwise null
        const service_sid = await getParam(context, 'SERVICE_SID');
        if (service_sid === null) return null; // service not yet deployed

        const environments = await client.serverless
          .services(service_sid)
          .environments.list({limit : 1});
        assert(environments && environments.length > 0, `error fetching environment for service_sid=${service_sid}!!!`);

        return environments[0].sid;
      }

      case 'ENVIRONMENT_DOMAIN':
      {
        // return domain_name only if deployed; otherwise null
        const service_sid = await getParam(context, 'SERVICE_SID');
        if (service_sid === null) return null; // service not yet deployed

        const environments = await client.serverless
          .services(service_sid)
          .environments.list({limit : 1});
        assert(environments && environments.length > 0, `error fetching environment for service_sid=${service_sid}!!!`);

        return environments[0].domainName;
      }

      case 'TWILIO_API_KEY_SID':
      {
        const apikeys = await client.keys.list();
        let apikey = apikeys.find(k => k.friendlyName === context.APPLICATION_NAME);
        if (apikey) {
          await setParam(context, key, apikey.sid);
          return apikey.sid;
        }

        console.log('API Key not found so creating a new API Key...');
        await client.newKeys
          .create({ friendlyName: context.APPLICATION_NAME })
          .then((result) => {
            apikey = result;
          })
          .catch(err => {
            throw new Error('Unable to create a API Key!!! ABORTING!!!');
          });

        await setParam(context, key, apikey.sid);
        await setParam(context, 'TWILIO_API_KEY_SECRET', apikey.secret);
        context.TWILIO_API_KEY_SECRET = apikey.secret;

        return apikey.sid;
      }

      case 'TWILIO_API_KEY_SECRET':
      {
        await getParam(context, 'TWILIO_API_KEY_SID');

        return context.TWILIO_API_KEY_SECRET;
      }

      case 'TWILIO_CONVERSATIONS_SID':
      {
        const services = await client.conversations.services.list();
        const service = services.find(s => s.friendlyName === context.APPLICATION_NAME);
        if (service) {
          await setParam(context, key, service.sid);
          return service.sid;
        }

        console.log('Conversation service not found so creating a new conversation service...');
        let sid = null;
        await client.conversations.services
          .create({ friendlyName: context.APPLICATION_NAME })
          .then((result) => {
            sid = result.sid;
          })
          .catch(err => {
            throw new Error('Unable to create a Twilio Conversation Service!!! ABORTING!!!');
          });
        await setParam(context, key, sid);

        return sid;
      }

      case 'TWILIO_SYNC_SID':
      {
        const services = await client.sync.services.list();
        const service = services.find(s => s.friendlyName === context.APPLICATION_NAME);
        if (service) {
          await setParam(context, key, service.sid);
          return service.sid;
        }

        console.log('Sync service not found so creating a new sync service...');
        let sid = null;
        await client.sync.services
          .create({ friendlyName: context.APPLICATION_NAME })
          .then((result) => {
            sid = result.sid;
          })
          .catch(err => {
            throw new Error('Unable to create a Twilio Sync Service!!! ABORTING!!!');
          });
        await setParam(context, key, sid);

        return sid;
      }

      case 'TWILIO_VERIFY_SID':
      {
        const services = await client.verify.services.list();
        const service = services.find(s => s.friendlyName === context.APPLICATION_NAME);
        if (service) {
          await setParam(context, key, service.sid);
          return service.sid;
        }

        console.log('Verify service not found so creating a new verify service...');
        let sid = null;
        await client.verify.services
          .create({ friendlyName: context.APPLICATION_NAME })
          .then((result) => {
            sid = result.sid;
          })
          .catch(err => {
              throw new Error('Unable to create a Twilio Verify Service!!! ABORTING!!!');
          });
        await setParam(context, key, sid);

        return sid;
      }

      default:
        if (key in context) return context[key];

        throw new Error(`Undefined key: ${key}!!!`);
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}


/* --------------------------------------------------------------------------------
 * read version attribute from package.json
 * --------------------------------------------------------------------------------
 */
async function fetchVersionToDeploy() {
  const fs = require('fs');
  const path = require('path');

  const fpath = path.join(process.cwd(), 'package.json');
  const payload = fs.readFileSync(fpath, 'utf8');
  const json = JSON.parse(payload);

  return json.version;
}


// --------------------------------------------------------------------------------
module.exports = {
  getParam,
  setParam,
  fetchVersionToDeploy,
  assertLocalhost,
};
