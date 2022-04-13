/* eslint-disable no-undef */
const JWEValidator = require('twilio-flex-token-validator').functionValidator;
const { getParam } = require(Runtime.getFunctions()['helpers'].path);

exports.handler = JWEValidator(async function(context, event, callback) {
  const response = new Twilio.Response();
  const client = context.getTwilioClient();
  response.setStatusCode(200);
  const { textBody, phoneNumber } = event; 
  try {
    await client.messages
      .create({
        body: textBody, 
        from: await getParam(context, 'ADMINISTRATOR_PHONE'), 
        to: phoneNumber,
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
});

function setUnauthorized(response) {
  response.setStatusCode(401)
    .setBody({Error: "Unauthorized"});
  return response;
}
