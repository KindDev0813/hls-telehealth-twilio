/* eslint-disable no-undef */

const JWEValidator = require('twilio-flex-token-validator').functionValidator;
const { getParam } = require(Runtime.getFunctions()['helpers'].path);

exports.handler = JWEValidator(async function(context, event, callback) {
  
  const response = new Twilio.Response();
  const client = context.getTwilioClient();
  response.setStatusCode(200);

  // textBody will be crafted on the flex side, which contains which caremanagement programs 
  // to text to the user.
  const { token, textBody, phoneNumber } = event; 

  try {
    if (!isValidAppToken(token, context)) 
      return callback(null, setUnauthorized(response));


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
