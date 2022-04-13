/* eslint-disable no-undef */
const { getParam } = require(Runtime.getFunctions()['helpers'].path);
const {path} = Runtime.getFunctions()["authentication-helper"];
const {isValidAppToken} = require(path);

/**
 * The provider will be verifying the call with their token and 
 * crafting a patient Link to schedule a video call with the patient.
 */
exports.handler = async function(context, event, callback) {
  
  const response = new Twilio.Response();
  const client = context.getTwilioClient();
  response.setStatusCode(200);
  const { token, patientPhone, url } = event; 

  try {
    if (!isValidAppToken(token, context)) 
      return callback(null, setUnauthorized(response));


    await client.messages
      .create({
        body: "Hi Patient!  To join the video room click on this link: " + url, 
        from: await getParam(context, 'TWILIO_PHONE_NUMBER'), 
        to: patientPhone,
      })
      .then(message => {
        console.log(message.sid);
        response.setBody({message: message});
      });

    return callback(null, response);
  } catch(err) {
    console.log(err);
    return callback(null, setUnauthorized(response));
  }
}

function setUnauthorized(response) {
  response.setStatusCode(401)
    .setBody({Error: "Unauthorized"});
  return response;
}