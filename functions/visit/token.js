const tokens = require(Runtime.getFunctions()["datastore/tokens"].path);

async function getPasscode(context, role, event, response) {
  if (!event.id) {
    response.setStatusCode(400);
    response.setBody({
      error: {
        message: 'missing id',
        explanation: 'The id parameter is missing.',
      },
    });
    return response;
  }

  const tokenData = await tokens.createToken(context, role, event);
  // Return token
  response.setStatusCode(200);
  response.setBody(tokenData);
  return response;
};

async function getToken(context, event, response) {
  if (!event.passcode) {
    response.setStatusCode(400);
    response.setBody({
      error: {
        message: 'missing passcode',
        explanation: 'The passcode parameter is missing.',
      },
    });
    return response;
  }

  const tokenData = await tokens.getToken(context, event.passcode);
  // Return token
  response.setStatusCode(200);
  response.setBody(tokenData);
  return response;
};

async function getSyncToken(context, role, event, response) {
  const tokenData = await tokens.getSyncToken(context, role);
  response.setBody(tokenData);
  response.setStatusCode(200);
  return response;
}

module.exports.handler = async (context, event, callback) => {
  // TODO: Secure this handler after debug
  let response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  if(event.action === 'PATIENT') {    
    await getPasscode(context, 'patient', event, response);
  }
  else if(event.action === 'VISITOR') {    
    await getPasscode(context, 'visitor', event, response);
  } 
  else if(event.action === 'PROVIDERVISITOR') {    
    await getPasscode(context, 'providervisitor', event, response);
  } 
  else if(event.action === 'PROVIDER') {    
    await getPasscode(context, 'provider', event, response);
  } 
  else if(event.action === 'PASSCODE') {
    await getPasscode(context, 'thirdParty', event, response);
  }
  else if (event.action === 'SYNC') {
    await getSyncToken(context, 'provider' ,event, response);
  }
  else if (event.action === 'TOKEN') {
    await getToken(context, event, response);
  } else {
    response.setStatusCode(400);
    response.setBody({error: "Unknown Action: ''. Expecting [TOKEN, VISITOR, PROVIDER, PASSCODE, SYNC]"});
  }    
  return callback(null, response);
};
