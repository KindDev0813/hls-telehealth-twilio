// const { cli } = require('cli-ux');
// const { CLIError } = require('@oclif/errors');
const { customAlphabet } = require('nanoid');
const fs = require('fs');
const { getListOfFunctionsAndAssets, getServerlessConfigs } = require('@twilio-labs/serverless-api/dist/utils/fs');
const moment = require('moment');
const path = require('path');
const { TwilioServerlessApiClient } = require('@twilio-labs/serverless-api');

const EXPIRY_PERIOD = 1000 * 60 * 60 * 24 * 7;

function getRandomInt(length) {
  return customAlphabet('1234567890', length)();
}

function getPasscode(domain, passcode) {
  const [, appID, serverlessID] = domain.match(/-?(\d*)-(\d+)(?:-\w+)?.twil.io$/);
  return `${passcode}${appID}${serverlessID}`;
}

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

function getMiddleware() {
  const authHandlerFn = fs.readFileSync(path.join(__dirname, './serverless/middleware/auth.js'));

  return [
    {
      name: 'auth-handler',
      path: '/auth-handler.js',
      content: authHandlerFn,
      access: 'private',
    },
  ];
}

async function findApp(twilioClient, appName) {
  const services = await twilioClient.serverless.services.list();
  return services.find(service => service.friendlyName.includes(appName));
}

async function getAppInfo(twilioClient, appName) {
  const app = await findApp(twilioClient, appName);

  if (!app) return null;

  const appInstance = await twilioClient.serverless.services(app.sid);

  const [environment] = await appInstance.environments.list();

  const variables = await appInstance.environments(environment.sid).variables.list();

  const assets = await appInstance.assets.list();

  const functions = await appInstance.functions.list();
  const tokenServerFunction = functions.find(fn => fn.friendlyName.includes('token'));

  const passcodeVar = variables.find(v => v.key === 'API_PASSCODE');
  const expiryVar = variables.find(v => v.key === 'API_PASSCODE_EXPIRY');
  const roomTypeVar = variables.find(v => v.key === 'ROOM_TYPE');

  const passcode = passcodeVar ? passcodeVar.value : '';
  const expiry = expiryVar ? expiryVar.value : '';
  const roomType = roomTypeVar ? roomTypeVar.value : '';

  const fullPasscode = getPasscode(environment.domainName, passcode);

  return {
    url: `https://${environment.domainName}?passcode=${fullPasscode}`,
    expiry: moment(Number(expiry)).toString(),
    sid: app.sid,
    passcode: fullPasscode,
    hasWebAssets: Boolean(assets.find(asset => asset.friendlyName.includes('index.html'))),
    roomType,
    environmentSid: environment.sid,
    functionSid: tokenServerFunction ? tokenServerFunction.sid : tokenServerFunction,
  };
}

async function displayAppInfo(twilioClient, appName) {
  const appInfo = await getAppInfo(twilioClient, appName);

  if (!appInfo) {
    console.log('There is no deployed app');
    return;
  }

  if (appInfo.hasWebAssets) {
    console.log(`Web App URL: ${appInfo.url}`);
  }

  console.log(`Passcode: ${appInfo.passcode.replace(/(\d{3})(\d{3})(\d{4})(\d{4})/, '$1 $2 $3 $4')}`);
  console.log(`Expires: ${appInfo.expiry}`);

  if (appInfo.roomType) {
    console.log(`Room Type: ${appInfo.roomType}`);
  }

  console.log(
    `Edit your token server at: https://www.twilio.com/console/functions/editor/${appInfo.sid}/environment/${appInfo.environmentSid}/function/${appInfo.functionSid}`
  );
}

async function findConversationsService(twilioClient, appName) {
  const services = await twilioClient.conversations.services.list();
  return services.find(service => service.friendlyName.includes(appName));
}

async function getConversationsServiceSID(twilioClient, appName) {
  const exisitingConversationsService = await findConversationsService(twilioClient, appName);

  if (exisitingConversationsService) {
    return exisitingConversationsService.sid;
  }

  const service = await twilioClient.conversations.services.create({
    friendlyName: `${appName}-conversations-service`,
  });
  return service.sid;
}

async function deploy(twilioClient, installationInfo, appInfo) {
  const assets = await getAssets();
  const { functions } = await getListOfFunctionsAndAssets(process.cwd(),{
    functionsFolderNames: ["functions"],
    assetsFolderNames: []
  });

  const pkgJsonRaw = fs.readFileSync(`${process.cwd()}/package.json`);
  const pkgJsonInfo = JSON.parse(pkgJsonRaw);
  const dependencies = pkgJsonInfo.dependencies;
  
  const serverlessClient = new TwilioServerlessApiClient({
    username: twilioClient.username,
    password: twilioClient.password,
  });

  const pin = getRandomInt(6);
  const expiryTime = Date.now() + EXPIRY_PERIOD;

  // cli.action.start('deploying app');

  const conversationServiceSid = await getConversationsServiceSID(twilioClient, installationInfo.appName);

  const deployOptions = {
    env: {
      TWILIO_API_KEY_SID: process.env.TWILIO_API_KEY_SID,
      TWILIO_API_KEY_SECRET: process.env.TWILIO_API_KEY_SECRET,
      API_PASSCODE: pin,
      API_PASSCODE_EXPIRY: expiryTime,
      // ROOM_TYPE: this.flags['room-type'],
      TWILIO_CONVERSATIONS_SID: conversationServiceSid,
      ...installationInfo
    },
    pkgJson: {
      dependencies,
    },
    functionsEnv: 'dev',
    functions,
    assets,
  };

  if (appInfo && appInfo.sid) {
    deployOptions.serviceSid = appInfo.sid;
  } else {
    deployOptions.serviceName = installationInfo.appName;
  }

  try {
    const { serviceSid } = await serverlessClient.deployProject(deployOptions);
    await twilioClient.serverless
      .services(serviceSid)
      .update({ includeCredentials: true });
      //.update({ includeCredentials: true, uiEditable: this.flags['ui-editable'] });
    // cli.action.stop();
  } catch (e) {
    console.error('Something went wrong', e);
  }
}

module.exports = {
  deploy,
  displayAppInfo,
  findApp,
  findConversationsService,
  getAssets,
  getMiddleware,
  getAppInfo,
  getPasscode,
  getRandomInt,
};
