/*
 * --------------------------------------------------------------------------------
 * sends sms via twilio
 *
 * event parameters:
 * .token: application token
 * .to_phone: mobile phone to send SMS to (E.164 format preferred)
 * .body: body of message
 *
 * from_phone will be context.TWILIO_PHONE_NUMBER
 *
 * returns:
 * . status = 200, if sms was successful
 * . status = 400, if sms was not successful, bad to_phone, etc.
 * --------------------------------------------------------------------------------
 */
const assert = require('assert');
const path_helper = Runtime.getFunctions()['helpers'].path;
const { getParam } = require(path_helper);
const { path } = Runtime.getFunctions()["authentication-helper"];
const { isValidAppToken } = require(path);

exports.handler = async function(context, event, callback) {
  const THIS = 'send-sms';
  console.log(THIS);
  console.time(THIS);

  try {
    /* Following code checks that a valid token was sent with the API call */
    assert(event.token);
    if (!isValidAppToken(event.token, context)) {
      const response = new Twilio.Response();
      response.appendHeader('Content-Type', 'application/json');
      response.setStatusCode(401);
      response.setBody({message: 'Invalid or expired token'});
      return callback(null, response);
    }

    const client = context.getTwilioClient();
    const from_phone = await getParam(context, 'TWILIO_PHONE_NUMBER');

    assert(from_phone, 'TWILIO_PHONE_NUMBER not configured!!!');
    assert(event.to_phone, 'missing event.to_phone!!!');
    assert(event.body, 'missing event.body!!!');
    assert(event.body.length <= 1600, 'event.body exceeds 1600 characters!!!');
    const to_phone = await client.lookups.v1.phoneNumbers(event.to_phone)
      .fetch({countryCode: 'US'})
      .then(phone => phone.phoneNumber);
    const message = await client.messages.create({
      body: event.body,
      from: from_phone,
      to: to_phone,
      //smartEncoded: true
    });


    if (message.sid)
      return callback(null, message.sid);
    else
      return callback(message);

  } catch (err) {
    console.log(THIS, err);
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
};
