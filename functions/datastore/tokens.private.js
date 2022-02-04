const TOKENS_MAP="Tokens"
const { createUserToken } = require(Runtime.getFunctions()["authentication-helper"].path);
const { fetchSyncMapItem, insertSyncMapItem } = require(Runtime.getFunctions()["datastore/datastore-helpers"].path);
const { getParam } = require(Runtime.getFunctions()['helpers'].path);
const AccessToken = Twilio.jwt.AccessToken;
const SyncGrant = AccessToken.SyncGrant;
const MAX_ALLOWED_SESSION_DURATION = 14400;

async function createToken(context, role, user) {
  const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');
  console.log("USER", user.name)
  const token = createUserToken(context, role, user.id, user.visitId, user.name);
  passcode = token.split('.')[2];
  const client = context.getTwilioClient();
  await insertSyncMapItem(client, TWILIO_SYNC_SID, TOKENS_MAP, passcode, { token });
  return { passcode, token };
}

async function getToken(context, passcode) {
  const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');
  const client = context.getTwilioClient();
  const item = await fetchSyncMapItem(client, TWILIO_SYNC_SID, TOKENS_MAP, passcode);
  return item.data;
}

async function getSyncToken(context, role) {
  const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');
  const { ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET } = context;

  // Sync Service is needed in dashboard which is why we meed to create a sync token
  const syncToken = new AccessToken(ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, {
    ttl: MAX_ALLOWED_SESSION_DURATION,
  });
  const syncGrant = new SyncGrant({ serviceSid: TWILIO_SYNC_SID });
  syncToken.identity = role;
  syncToken.addGrant(syncGrant);
  const token = syncToken.toJwt();
  return { token }
}

module.exports = {
  createToken,
  getToken,
  getSyncToken
}