/* global Twilio Runtime */
'use strict';

const AccessToken = Twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const ChatGrant = AccessToken.ChatGrant;
const MAX_ALLOWED_SESSION_DURATION = 14400;

module.exports.handler = async (context, event, callback) => {
  const { ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, ROOM_TYPE, TWILIO_CONVERSATIONS_SID } = context;

  // TODO: Add Patient Auth Handler
  const { validateAndDecodeAppToken } = require(Runtime.getFunctions()['authentication-helper'].path);
  const tokenValidationResult = validateAndDecodeAppToken(context, event, ['provider']);

  if(tokenValidationResult.response) {
    return callback(null, tokenValidationResult.response);
  }

  const { room_sid, action } = event;
  const { id } = tokenValidationResult.decoded;
  let response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (!id) {
    response.setStatusCode(400);
    response.setBody({
      error: {
        message: 'missing id',
        explanation: 'The id parameter is missing.',
      },
    });
    return callback(null, response);
  }

  if (!room_sid) {
    response.setStatusCode(400);
    response.setBody({
      error: {
        message: 'missing room_sid',
        explanation: 'The room_sid parameter is missing.',
      },
    });
    return callback(null, response);
  }

  if (!action) {
    response.setStatusCode(400);
    response.setBody({
      error: {
        message: 'missing action',
        explanation: 'The action parameter is missing. Use "start" to start recording and "stop" to stop recording',
      },
    });
    return callback(null, response);
  }

  const client = context.getTwilioClient();
  try {
      await client.video.rooms(room_sid)
      .recordingRules
      .update({rules: [{
        "type": action === 'start' ? 'include' : 'exclude',
        "all": true }]
      });
  } catch (e) {      
      response.setStatusCode(500);
      response.setBody({
        error: {
          message: `error ${action} recording`,
          explanation: 'Something went wrong when updating recording',
          exception: e
        },
      });
      return callback(null, response);
  }

  // Return token
  response.setStatusCode(200);
  response.setBody({ room_sid });
  return callback(null, response);
};
