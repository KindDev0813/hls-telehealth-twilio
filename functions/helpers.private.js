/* --------------------------------------------------------------------------------
 * common helper function used by functions
 *
 * behavior depends on deployment status of the service
 *
 * getAllParams(context)
 * getParam(context, key)
 * setParam(context, key, value) - when running on localhost, sets variable on deployed service
 *
 * include via:
 *   const { getAllParams, getParam, setParam } = require(Runtime.getFunctions()['helper'].path);
 *
 * --------------------------------------------------------------------------------
 */
const assert = require("assert");

const SERVER_START_TIMESTAMP = new Date().toISOString().replace(/.\d+Z$/g, "Z");

/* --------------------------------------------------------------------------------
 * is executing on localhost
 * --------------------------------------------------------------------------------
 */
function isLocalhost(context) {
  return context.DOMAIN_NAME.startsWith('localhost:');
}

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

  const client = context.getTwilioClient();
  try {
    switch (key) {

      case 'IS_LOCALHOST': {
        return isLocalhost(context);
      }

      case 'SERVICE_SID': {
        // will throw error when running on localhost, so lookup by name if localhost
        if (! isLocalhost(context) && context.SERVICE_SID) return context.SERVICE_SID;

        const services = await client.serverless.services.list();
        const service = services.find(s => s.uniqueName === context.APPLICATION_NAME);

        return (service && service.sid) ? service.sid : null;
      }

      case 'ENVIRONMENT_SID': {
        // will throw error when running on localhost, so lookup by name if localhost
        if (! isLocalhost(context) && context.ENVIRONMENT_SID) return context.ENVIRONMENT_SID;

        const service_sid = await getParam(context, 'SERVICE_SID');
        if (service_sid === null) {
          return null; // service not yet deployed
        }
        const environments = await client.serverless
          .services(service_sid)
          .environments.list({limit : 1});

        return environments.length > 0 ? environments[0].sid : null;
      }

      case 'ENVIRONMENT_DOMAIN': {
        // will throw error when running on localhost, so lookup by name if localhost
        const service_sid = await getParam(context, 'SERVICE_SID');
        if (service_sid === null) {
          return null; // service not yet deployed
        }
        const environment_sid = await getParam(context, 'ENVIRONMENT_SID');

        const environment = await client.serverless
          .services(service_sid)
          .environments(environment_sid)
          .fetch();

        return environment.domainName;
      }

      case 'TWILIO_API_KEY_SID': {
        // value set in .env takes precedence
        if (context.TWILIO_API_KEY_SID) return context.TWILIO_API_KEY_SID

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

      case 'TWILIO_API_KEY_SECRET': {
        // value set in .env takes precedence
        if (context.TWILIO_API_KEY_SECRET) return context.TWILIO_API_KEY_SECRET

        await getParam(context, 'TWILIO_API_KEY_SID');

        return context.TWILIO_API_KEY_SECRET;
      }

      case 'TWILIO_CONVERSATIONS_SID': {
        // value set in .env takes precedence
        if (context.TWILIO_CONVERSATIONS_SID) return context.TWILIO_CONVERSATIONS_SID

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

      case 'TWILIO_SENDGRID_API_KEY': {
        // value set in .env takes precedence
        return context.TWILIO_SENDGRID_API_KEY
      }

      case 'TWILIO_SYNC_SID': {
        // value set in .env takes precedence
        if (context.TWILIO_SYNC_SID) return context.TWILIO_SYNC_SID

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

      case 'TWILIO_VERIFY_SID': {
        // value set in .env takes precedence
        if (context.TWILIO_SYNC_SID) return context.TWILIO_SYNC_SID

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

      case 'SERVER_START_TIMESTAMP': {
        return SERVER_START_TIMESTAMP;
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
 * retrieve all environment variable value
 *
 * Note that SERVICE_SID & ENVIRONMENT_SID will return 'null' if not yet deployed
 *
 * parameters:
 * - context: Twilio Runtime context
 *
 * returns
 * - object of all environment variable values
 * --------------------------------------------------------------------------------
 */
async function getAllParams(context) {

  const keys_context = Object.keys(context);
  // keys defined in getParam function above
  const keys_derived = [
    'IS_LOCALHOST',
  ];

  // to force saving of 'secret'
  await getParam(context, 'TWILIO_API_KEY_SID');

  const keys_all = keys_context.concat(keys_derived).sort();
  try {

    const result = {};
    for (k of keys_all) {
      if (k === 'getTwilioClient') continue; // exclude getTwilioClient function
      result[k] = await getParam(context, k);
    }
    return result;

  } catch (err) {
    console.log(err);
    throw err;
  }
}


// --------------------------------------------------------------------------------
module.exports = {
  getAllParams,
  getParam,
  setParam,
  isLocalhost,
  assertLocalhost,
};
