/*
 * --------------------------------------------------------------------------------
 * seed datastore with data from private assets in /assets/datastore/FHIR
 *
 * --------------------------------------------------------------------------------
 */

const assert = require("assert");
const path = require("path");
const { getParam, assertLocalhost } = require(Runtime.getFunctions()['helpers'].path);
const { upsertSyncDocument } = require(Runtime.getFunctions()['datastore/datastore-helpers'].path);

// --------------------------------------------------------------------------------
async function seedResource(context, syncServiceSid, seedAssetPath) {
  // open private asset
  const asset = Runtime.getAssets()[seedAssetPath];
  const bundle = JSON.parse(asset.open());
  assert(bundle.total === bundle.entry.length, 'bundle checksum error!!!');
  const syncDocumentName = path.basename(asset.path)
    .replace(/.+FHIR\//, '')
    .replace('.private.json', '')
    .replace('.json', '');

  const document = await upsertSyncDocument(context, syncServiceSid, syncDocumentName, bundle);

  return {
    uniqueName: document.uniqueName,
    sid: document.sid,
    resourceCount: document.data.entry.length,
  };
}

// --------------------------------------------------------------------------------
exports.handler = async function(context, event, callback) {
  const THIS = 'seed';
  console.time(THIS);

  try {
    assertLocalhost(context);
    const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');

    const assets = Runtime.getAssets(); // get all private assets
    console.log("assets::", assets);
    resources = Object.values(assets)
      .map((e) => {
        return e.path.replace(/.+assets/, '').replace('.private', '');
      });
    console.log(THIS, `found ${resources.length} FHIR resources to seed`);

    const response = [];
    for(r of resources) {
      const document = await seedResource(context, TWILIO_SYNC_SID, r);
      console.log(THIS, `... upserted ${r}, ${document.resourceCount} resources`);
      response.push(document);
    }

    return callback(null, response);

  } catch (err) {
    console.log(THIS, err);
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
}

