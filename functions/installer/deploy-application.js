'use strict';
/* --------------------------------------------------------------------------------
 * deploys application to target Twilio account.
 * - deploy services & makeEditable
 * - set environment variables
 * - seed data
 *
 * NOTE: that this function can only be run on localhost
 *
 * - service identified via unique_name = APPLICATION_NAME in helpers.private.js
 *
 * event:
 * .parameters: object of key-value parameters to configure
 *
 * returns:
 * {
 *   deploy_state: DEPLOYED|NOT-DEPLOYED
 *   service_sid : SID of deployed service
 * }
 * --------------------------------------------------------------------------------
 */
const { getParam, getAllParams, isLocalhost, assertLocalhost } = require(Runtime.getFunctions()['helpers'].path);
const { TwilioServerlessApiClient } = require('@twilio-labs/serverless-api');
const { getListOfFunctionsAndAssets } = require('@twilio-labs/serverless-api/dist/utils/fs');
const fs = require('fs');
const http = require('http');
const https = require('https');
const assert = require("assert");


exports.handler = async function(context, event, callback) {
  const THIS = 'deploy';

  assert(context.DOMAIN_NAME.startsWith('localhost:'), `Can only run on localhost!!!`);
  console.time(THIS);
  try {
    const action = event.action ? event.action : 'DEPLOY';

    console.log(THIS, `${action} starting ...`);
    switch (action) {

      case 'DELETE':
        console.log(THIS, `${action} not implemented yet`);
        //deleteApplication();
        console.log(THIS, `${action} successful`);
        break;

      case 'DEPLOY':
        const service_sid = await deploy(context, event);
        console.log(THIS, `${action} successful`);
        return callback(null, {
          service_sid: service_sid,
          service_status: 'DEPLOYED',
        });
        break;

      default:
        throw new Error(`unknown event.action=${action}`);
    }


  } catch(err) {
    console.log(err);
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
}


async function deploy(context, event) {
  const THIS = 'deploy';

  const client = context.getTwilioClient();

  assert(event.configuration.APPLICATION_NAME, '.env file does not contain APPLICATION_NAME variable!!!');
  const application_name = event.configuration.APPLICATION_NAME;

  console.log(THIS, `Deploying Twilio service ... ${application_name}`);

  // remove previously created API_KEY as there's no way to access the API secret after initial creation.
  const apikeys = await client.keys.list();
  const apikey = apikeys.find(k => k.friendlyName === context.APPLICATION_NAME);
  if (apikey) {
    console.log(THIS, 'remove existing API KEY named telehealth');
    await client.keys(apikey.sid).remove();
    context.TWILIO_API_KEY_SID = null;
    context.TWILIO_API_KEY_SECRET = null;
  }

  const environmentVariables = event.configuration;
  console.log(THIS, 'configuration:', environmentVariables);

  const service_sid = await deployService(context, environmentVariables);
  console.log(THIS, `Deployed: ${service_sid}`);

  console.log(THIS, 'Make Twilio service editable ...');
  await client.serverless
    .services(service_sid)
    .update({ uiEditable: true });

  console.log(THIS, 'Provisioning dependent Twilio services');
  const params = await getAllParams(context);
  console.log(THIS, params);

  console.log(THIS, 'Seed application data');
  const summary = await seedData(context);
  console.log(THIS, summary);

  console.log(THIS, `Completed deployment of ${application_name}`);

  return {
    service_sid: service_sid
  };
}

/* --------------------------------------------------------------------------------
 * deploys (creates new/updates existing) service to target Twilio account.
 *
 * - service identified via unique_name = APPLICATION_NAME in helpers.private.js
 *
 * returns: service SID, if successful
 * --------------------------------------------------------------------------------
 */
async function getAssets() {
  const { assets } = await getListOfFunctionsAndAssets(process.cwd(), {
    functionsFolderNames: [],
    assetsFolderNames: ["assets"],
  });
  //console.log('asset count:', assets.length);

  const indexHTMLs = assets.filter(asset => asset.name.includes('index.html'));
  // Set indext.html as a default document
  const allAssets = assets.concat(indexHTMLs.map(ih => ({
    ...ih,
    path: ih.name.replace("index.html", ""),
    name: ih.name.replace("index.html", ""),
  })));
  //console.log(allAssets);
  return allAssets;
}


async function deployService(context, envrionmentVariables = {}) {
  const client = context.getTwilioClient();

  const assets = await getAssets();
  console.log('asset count:' , assets.length);

  const { functions } = await getListOfFunctionsAndAssets(process.cwd(),{
    functionsFolderNames: ["functions"],
    assetsFolderNames: []
  });
  console.log('function count:' , functions.length);

  const pkgJsonRaw = fs.readFileSync(`${process.cwd()}/package.json`);
  const pkgJsonInfo = JSON.parse(pkgJsonRaw);
  const dependencies = pkgJsonInfo.dependencies;
  console.log('package.json loaded');

  const deployOptions = {
    env: {
      ...envrionmentVariables
    },
    pkgJson: {
      dependencies,
    },
    functionsEnv: 'dev',
    functions,
    assets,
    runtime: 'node14',
  };
  console.log('deployOptions.env:', deployOptions.env);

  context['APPLICATION_NAME'] = envrionmentVariables.APPLICATION_NAME;
  let service_sid = await getParam(context, 'SERVICE_SID');
  if (service_sid) {
    // update service
    console.log('updating services ...');
    deployOptions.serviceSid = service_sid;
  } else {
    // create service
    console.log('creating services ...');
    deployOptions.serviceName = await getParam(context, 'APPLICATION_NAME');
  }

  const serverlessClient = new TwilioServerlessApiClient({
    username: client.username, // ACCOUNT_SID
    password: client.password, // AUTH_TOKEN
  });

  serverlessClient.on("status-update", evt => {
    console.log(evt.message);
  });

  await serverlessClient.deployProject(deployOptions);
  service_sid = await getParam(context, 'SERVICE_SID');

  return service_sid;
}


/* --------------------------------------------------------------------------------
 * seed application data.
 *
 * returns: seed summary
 * --------------------------------------------------------------------------------
 */
async function seedData(context) {
  const options = {
    hostname: context.DOMAIN_NAME.split(':')[0],
    port: context.DOMAIN_NAME.split(':')[1] ? context.DOMAIN_NAME.split(':')[1] : '443',
    path: '/datastore/seed',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  };
  const http_protocol = isLocalhost(context) ? http : https;

  return new Promise((resolve, reject) => {
    const request = http_protocol.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        resolve(JSON.parse(data));
      });
      response.on('error', (error) => {
        reject(error);
      });
    });
    request.end();
  });
}
