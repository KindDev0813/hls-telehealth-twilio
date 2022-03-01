'use strict';


/**
 * 
 * @param {*} context 
 * @param {providerToken: string, roomSid: string} event 
 * @param {*} callback 
 * @returns 
 */
module.exports.handler = async (context, event, callback) => {
  const { ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, ROOM_TYPE, TWILIO_CONVERSATIONS_SID } = context;

  // TODO: Add Patient Auth Handler
  const { validateAndDecodeAppToken } = require(Runtime.getFunctions()['authentication-helper'].path);
  const tokenValidationResult = validateAndDecodeAppToken(context, event, ['provider']);

  if(tokenValidationResult.response) {
    return callback(null, tokenValidationResult.response);
  }

  const { roomSid } = event;
  const { id } = tokenValidationResult.decoded;
  const client = context.getTwilioClient();
  let response = new Twilio.Response();
  response.setStatusCode(200);
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

  if (!roomSid) {
    response.setStatusCode(400);
    response.setBody({
      error: {
        message: 'Missing Room Sid',
        explanation: 'Room Sid is needed to complete a room.',
      },
    });
    return callback(null, response);
  }

  if (!roomSid.startsWith('RM')) {
    response.setStatusCode(400);
    response.setBody({
      error: {
        message: 'Incorrect Room Sid Format',
        explanation: 'Room Sids start with RM....',
      },
    });
    return callback(null, response);
  }

  try {
    const roomStatus = await client.video.rooms(roomSid)
      .fetch(room => room);
    
    console.log("before", roomStatus);
    await client.video.rooms(roomSid)
      .update({status: 'completed'})
      .then(room => room.sid);
  } catch (err) {
    response.setBody({
      error: {message: "Failed to Complete Room"}
    });
    return callback(null, response);
  }
   
  response.setBody({data: `Room ${roomSid} has been completedsss and removed.`});
  return callback(null, response);
};
