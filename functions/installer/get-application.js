'use strict';
/* --------------------------------------------------------------------------------
 * retrieves information about application:
 * - Twilio account
 * - purchase Twilio phone numbers
 * - environment variables defined in .env file
 * - current environment variable values, if service already deployed
 *
 * NOTE: that this function can only be run on localhost
 *
 * - service identified via unique_name = APPLICATION_NAME in helpers.private.js
 *
 * event:
 * . n/a
 *
 * returns:
 * - twilioAccountName:
 * - twilioPhoneNumbers: [ { phoneNumber, friendlyName } ]
 * - configurationVariables: [ { key, required, format, description, link, default, configurable, contentKey } ]
 *   see https://github.com/twilio-labs/configure-env/blob/main/docs/SCHEMA.md
 * - configurationValues : { key: value, ... }
 * --------------------------------------------------------------------------------
 */
const { getParam, assertLocalhost } = require(Runtime.getFunctions()['helpers'].path);

exports.handler = async function (context, event, callback) {
  const THIS = 'get-application';

  console.time(THIS);
  assertLocalhost(context);
  try {
    const client = context.getTwilioClient();

    const response = {}

    // ---------- account information
    {
      const account = await client.api.accounts(context.ACCOUNT_SID).fetch();

      console.log(THIS, `retrieved twilio account named: ${account.friendlyName}`);
      response.twilioAccountName = account.friendlyName;
    }

    // ---------- phone numbers
    {
      const phoneList = await client.api.accounts(context.ACCOUNT_SID).incomingPhoneNumbers.list();

      console.log(THIS, `retrieved ${phoneList.length} twilio phone numbers`);
      response.twilioPhoneNumbers = phoneList.map(p => {
        return {
          phoneNumber: p.phoneNumber,
          friendlyName: p.friendlyName,
        }
      });
    }

    // ---------- configuration variables
    {
      const variables = await readConfigurationVariables();

      console.log(THIS, `read ${variables.length} variables`);
      response.configurationVariables = variables;
    }

    // ---------- configuration values
    {
      const application_name = await getParam(context, 'APPLICATION_NAME');
      const service_sid = await getParam(context, 'SERVICE_SID');
      if (service_sid) {
        console.log(THIS, `found deployed application ${application_name}, retrieving variable values`);
        const environment_sid = await getParam(context, 'ENVIRONMENT_SID');

        const values = await client.serverless
          .services(service_sid)
          .environments(environment_sid)
          .variables.list();
        console.log(THIS, `retrieved ${values.length} variable values`);
        for(const v of values) {
          const k = response.configurationVariables.find(e => e.key === v.key);
          if (k) {
            k['value'] = v.value;
          }
        }
      }
    }

    //console.log(THIS, response);
    return callback(null, response);

  } catch (err) {
    console.log(THIS, err);
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
}

/* --------------------------------------------------------------------------------
 * read .env file content
 *
 * uses configure-env to parse .env file (https://www.npmjs.com/package/configure-env)
 * --------------------------------------------------------------------------------
 */
async function readConfigurationVariables() {
  const path = require('path')
  const path_env = path.join(process.cwd(), '.env');
  const fs = require('fs')
  const configure_env = require("configure-env");

  const payload = fs.readFileSync(path_env, 'utf8')
  const configuration = configure_env.parser.parse(payload)

  return configuration.variables;
}