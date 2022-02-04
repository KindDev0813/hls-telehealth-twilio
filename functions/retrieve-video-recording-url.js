/*
 * --------------------------------------------------------------------------------
 * retrieve last within 30 days video recording link (composition) for specified appointment
 *
 * event parameters:
 * .appointment_id: id of appointment that is also the video room uniqueName
 *
 * returns:
 * https://www.twilio.com/docs/video/api/compositions-resource#composition-instance-resource, if successful
 * 'undefined' otherwise
 *
 * --------------------------------------------------------------------------------
 */
const assert = require("assert");
const { getParam } = require(Runtime.getFunctions()['helpers'].path);

// --------------------------------------------------------------------------------
async function retrieveVideoCompositionMediaURL(context, appointment_id, retrieve_since = 30) {
  const THIS = retrieveVideoCompositionMediaURL.name;

  const roomName = appointment_id;
  const retrieve_since_dt = new Date(new Date().getTime() - 1000*60*60*24*retrieve_since);

  const client = context.getTwilioClient();
  // ---------- fetch all rooms matching appointment_id
  const rooms = await client.video.rooms.list({ uniqueName: roomName, status: 'completed' });
  console.log(THIS, `rooms (name=${appointment_id}) count = ${rooms.length}`);

  // ---------- find first room within last 30 days
  const room = rooms.find((e) => e.dateUpdated >= retrieve_since_dt);

  if (!room) return null;

  console.log(THIS, `room (since ${retrieve_since_dt.toISOString()}): ${JSON.stringify(room)}`);

  // ---------- fetch video compositions for room
  const compositions = await client.video.compositions.list({ roomSid: room.sid, status: 'completed' });
  console.log(THIS, `${room.sid} has ${compositions.length} compositions`);

  console.log(THIS, compositions[0].dateCompleted
    , (compositions[0].dateCompleted >= room.dateUpdated ? '>=' : '<')
    , room.dateUpdated);
  const composition = compositions.find((e) => e.dateCompleted >= room.dateUpdated);
  console.log(THIS, `composition (since ${room.dateUpdated.toISOString()}): ${JSON.stringify(composition)}`);

  if (!composition) return null;

  const uri = `https://video.twilio.com/v1/Compositions/${composition.sid}/Media?Ttl=3600`;
  let url = null;
  await client.request({
      method: "GET",
      uri: uri,
    })
    .then((response) => {
      // For example, download the media to a local file
      url = response.body.redirect_to;
    })
    .catch((error) => {
      throw Error("Error fetching /Media resource " + error);
    });

  return url;
}


// --------------------------------------------------------------------------------
exports.handler = async function(context, event, callback) {
  const THIS = 'retrieve-video-recording-url';
  console.time(THIS);
  const { isValidAppToken } = require(Runtime.getFunctions()["authentication-helper"].path);

  try {
    assert(event.token);
    /* Following code checks that a valid token was sent with the API call */
    if (!isValidAppToken(event.token, context)) {
      const response = new Twilio.Response();
      response.appendHeader('Content-Type', 'application/json');
      response.setStatusCode(401);
      response.setBody({message: 'Invalid or expired token'});
      return callback(null, response);
    }
  
    assert(event.appointment_id, 'Missing event.appointment_id!!!');

    const url = await retrieveVideoCompositionMediaURL(context, event.appointment_id);

    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'application/json');
    response.setBody({ url: url });

    console.log(THIS, url);

    return callback(null, response);

  } catch (err) {
    console.log(THIS, err);
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
}
