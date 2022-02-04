/*
 * ----------------------------------------------------------------------------------------------------
 * helper functions for datastore functions
 * - manages persistent storage using Twilio Sync
 *
 * depends on:
 *   SYNC_SERVICE_SID: Sync service sid, automatically procured in helpers.private.js
 * ----------------------------------------------------------------------------------------------------
 */

const assert = require('assert');
const http = require("http");
const https = require("https");

/*
 * ----------------------------------------------------------------------------------------------------
 * seclt a Sync document
 *
 * parameters:
 * - context: Twilio runtime context
 * - syncServiceSid: Sync service SID
 * - syncDocumentName: unique Sync document name
 *
 * returns: select object, null if document does not exist
 * ----------------------------------------------------------------------------------------------------
 */
async function _fetchSyncDocument(client, syncServiceSid, syncDocumentName) {
  const documents = await client.sync
    .services(syncServiceSid)
    .documents
    .list();
  const document = documents.find(d => d.uniqueName === syncDocumentName);

  return document; // will be 'undefined' is not found
}


/*
 * ----------------------------------------------------------------------------------------------------
 * select a Sync document
 *
 * parameters:
 * - context: Twilio runtime context
 * - syncServiceSid: Sync service SID
 * - syncDocumentName: unique Sync document name
 *
 * returns: select object, null if document does not exist
 * ----------------------------------------------------------------------------------------------------
 */
async function selectSyncDocument(context, syncServiceSid, syncDocumentName) {
  assert(context, 'missing parameter: context!!!');
  assert(syncServiceSid, 'missing parameter: syncServiceSid!!!');
  assert(syncDocumentName, 'missing parameter: syncDocumentName!!!');

  const client = context.getTwilioClient();

  const document = await _fetchSyncDocument(client, syncServiceSid, syncDocumentName)

  return document ? document.data : null;
}


/*
 * ----------------------------------------------------------------------------------------------------
 * insert/update a new Sync document
 *
 * parameters
 * - context: Twilio runtime context
 * - syncServiceSid: Sync service SID
 * - syncDocumentName: unique Sync document name
 * - documentData: document data object
 *
 * returns: document if successful
 * ----------------------------------------------------------------------------------------------------
 */
async function upsertSyncDocument(context, syncServiceSid, syncDocumentName, syncDocumentData) {
  assert(context, 'missing parameter: context!!!');
  assert(syncServiceSid, 'missing parameter: syncServiceSid!!!');
  assert(syncDocumentName, 'missing parameter: syncDocumentName!!!');
  assert(syncDocumentData, 'missing parameter: syncDocumentData!!!');

  const client = context.getTwilioClient();

  let document = await _fetchSyncDocument(client, syncServiceSid, syncDocumentName)

  if (document) {
    document = await client.sync
      .services(syncServiceSid)
      .documents(document.sid)
      .update({
        data: syncDocumentData,
      });
  } else {
    console.log('creating document:', syncDocumentName);
    document = await client.sync
      .services(syncServiceSid)
      .documents.create({
        data: syncDocumentData,
        uniqueName: syncDocumentName,
      });
  }
  return document;
}

/*
 * ----------------------------------------------------------------------------------------------------
 * delete an existing Sync document
 *
 * parameters
 * - context: Twilio runtime context
 * - syncServiceSid: Sync service SID
 * - syncDocumentName: unique Sync document name
 *
 * returns: document if successful, null if nothing was delete
 * ----------------------------------------------------------------------------------------------------
 */
async function deleteSyncDocument(context, syncServiceSid, syncDocumentName) {
  assert(context, 'missing parameter: context!!!');
  assert(syncServiceSid, 'missing parameter: syncServiceSid!!!');
  assert(syncDocumentName, 'missing parameter: syncDocumentName!!!');

  const client = context.getTwilioClient();

  const document = await _fetchSyncDocument(client, syncServiceSid, syncDocumentName)

  if (document) {
    await client.sync
      .services(syncServiceSid)
      .documents(document.sid).remove();
    return document;
  } else {
    return null;
  }
}

function __ensureSyncMapCreated(client, syncServiceSid, syncMapName) {
  return client.sync
    .services(syncServiceSid)
    .syncMaps(syncMapName)
    .fetch()
    .catch(err => {
      console.log(err);
      if(err.status === 404) {
        return client.sync
        .services(syncServiceSid)
        .syncMaps
        .create({uniqueName: syncMapName});
      }

      return Promise.resolve();
    });
}

async function fetchSyncMapItem(client, syncServiceSid, syncMapName, syncMapItemKey) {
  return await __ensureSyncMapCreated(client, syncServiceSid, syncMapName)
    .then(() => client.sync
      .services(syncServiceSid)
      .syncMaps(syncMapName)
      .syncMapItems(syncMapItemKey)
      .fetch());
}

async function insertSyncMapItem(client, syncServiceSid, syncMapName, syncMapItemKey, data) {
  await __ensureSyncMapCreated(client, syncServiceSid, syncMapName)
  .then(() => client.sync
    .services(syncServiceSid)
    .syncMaps(syncMapName)
    .syncMapItems
    .create({key: syncMapItemKey, data })
    .then(mapItem => console.log(mapItem.key)));
}

async function updateSyncMapItem(client, syncServiceSid, syncMapName, syncMapItemKey, newData) {
  await client.sync
    .services(syncServiceSid)
    .syncMaps(syncMapName)
    .syncMapItems(syncMapItemKey)
    .update({ data: newData })
    .then(syncMapItem => console.log("Updated SyncMapItem: ",syncMapItem))
    .catch(err => console.log(err));
}


/*
 * ----------------------------------------------------------------------------------------------------
 * reads FHIR resources stored as Sync document
 *
 * resources are stored as FHIR Bundle resource of type=searchset
 *
 * parameters
 * - context: Twilio runtime context
 * - resourceType: FHIR resource type in plural (e.g., Patients)
 *
 * returns: array of requested FHIR resources
 * ----------------------------------------------------------------------------------------------------
 */
async function read_fhir(context, syncServiceSid, resourceType) {

  const bundle = await selectSyncDocument(context, syncServiceSid, resourceType);
  assert(bundle.total === bundle.entry.length, 'bundle checksum error!!!');

  return bundle.entry;
}


/*
 * ----------------------------------------------------------------------------------------------------
 * saves FHIR resources stored as Sync document, effectively over-writing previous
 *
 * resources are stored as FHIR Bundle resource of type=searchset
 *
 * parameters
 * - context: Twilio runtime context
 * - resourceType: FHIR resource type in plural (e.g., Patients)
 * - resources: array of FHIR resources to save
 *
 * returns: Sync document
 * ----------------------------------------------------------------------------------------------------
 */
async function save_fhir(context, syncServiceSid, resourceType, resources) {

  const bundle = {
    resourceType: 'Bundle',
    type: 'searchset',
    total: resources.length,
    entry: resources,
  }
  const document = await upsertSyncDocument(context, syncServiceSid, resourceType, bundle);

  return document ? document.sid : null;
}


/*
 * ----------------------------------------------------------------------------------------------------
 * fetches content of public json asset via https
 *
 * parameters
 * - context: Twilio runtime context
 * - assetPath: url path to asset
 *
 * returns: json content of asset
 * ----------------------------------------------------------------------------------------------------
 */
async function fetchPublicJsonAsset(context, assetPath) {
  const hostname = context.DOMAIN_NAME.split(':')[0];
  const port = context.DOMAIN_NAME.split(':')[1];
  const options = {
    hostname: hostname,
    port: port,
    path: assetPath,
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  };
  const http_protocol = (hostname === 'localhost') ? http : https;

  return new Promise((resolve, reject) => {
    const request = http_protocol.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        resolve(JSON.parse(data));
      });
      response.on('error', (error) => {
        reject(error);
      });
    });
    request.end();
  });
}


// --------------------------------------------------------------------------------
module.exports = {
  read_fhir,
  save_fhir,
  selectSyncDocument,
  upsertSyncDocument,
  deleteSyncDocument,
  fetchSyncMapItem,
  insertSyncMapItem,
  updateSyncMapItem,
  fetchPublicJsonAsset,
};
