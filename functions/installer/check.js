'use strict';
/*
 * --------------------------------------------------------------------------------
 * checks deployment of service in target Twilio account.
 *
 * NOTE: that this function can only be run on localhost
 *
 * - service identified via unique_name = APPLICATION_NAME in helpers.private.js
 *
 * event:
 * . n/a
 *
 * returns:
 * {
 *   deploy_state: DEPLOYED|NOT-DEPLOYED
 *   service_sid : SID of deployed service
 * }
 * --------------------------------------------------------------------------------
 */
const assert = require('assert');
const { getParam, fetchVersionToDeploy, assertLocalhost } = require(Runtime.getFunctions()['helpers'].path);

exports.handler = async function (context, event, callback) {
  const THIS = 'check';

  console.time(THIS);
  assertLocalhost(context);
  try {

    const application_name    = await getParam(context, 'APPLICATION_NAME');
    const service_sid         = await getParam(context, 'SERVICE_SID');
    const application_version = await getParam(context, 'APPLICATION_VERSION');
    const environment_domain  = service_sid ? await getParam(context, 'ENVIRONMENT_DOMAIN') : null;
    const application_url     = service_sid
      ? `https:/${environment_domain}/administration.html`
      : `administration.html`; // relative url when on localhost and serice is not yet deployed

    console.log(THIS, `SERVICE_SID for APPLICATION_NAME (${application_name}): ${service_sid}) at ${application_url}`);

    const response = {
      deploy_state   : service_sid ? 'DEPLOYED' : 'NOT-DEPLOYED',
      version: {
        deployed : application_version,
        to_deploy: await fetchVersionToDeploy(),
      },
      service_sid    : service_sid ? service_sid : '',
      application_url: service_sid ? application_url : '',
    }
    return callback(null, response);

  } catch (err) {
    console.log(THIS, err);
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
}
