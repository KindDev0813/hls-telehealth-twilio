/*
 * --------------------------------------------------------------------------------
 * insurance eligibility check
 *
 *
 * event parameters:
 * .action: USAGE|SCHEMA|PROTOTYPE|GET, default USAGE
 * --------------------------------------------------------------------------------
 */

const SCHEMA = '/datastore/eligibility-schema.json';
const PROTOTYPE = '/datastore/eligibility-prototype.json';
const FHIR_COVERAGE_ELIGIBILITY_RESPONSE = 'CoverageEligibilityResponses';

const assert = require("assert");
const { getParam } = require(Runtime.getFunctions()['helpers'].path);
const { read_fhir, fetchPublicJsonAsset } = require(Runtime.getFunctions()['datastore/datastore-helpers'].path);

// --------------------------------------------------------------------------------
function transform_fhir_to_eligibility(CoverageEligibilityResponse) {
  const r = CoverageEligibilityResponse;
  const eligibility = {
    copay_usd: r.insurance[0].item[0].benefit.find(e => e.type.text === 'copay').allowedMoney.value,
  };
  return eligibility;
}


// --------------------------------------------------------------------------------
exports.handler = async function(context, event, callback) {
  const THIS = 'eligibility:';
  console.time(THIS);
  const { isValidAppToken } = require(Runtime.getFunctions()["authentication-helper"].path);

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
  
    const action = event.action ? event.action : 'USAGE'; // default action

    switch (action) {

      case 'USAGE': {
        // json prototype for ADD
        const prototype = await fetchPublicJsonAsset(context, PROTOTYPE);

        const usage = {
          action: 'usage for eligibility function',
          USAGE: {
            description: 'returns function signature, default action',
            parameters: {},
          },
          SCHEMA: {
            description: 'returns json schema for eligibility in telehealth',
            parameters: {},
          },
          PROTOTYPE: {
            description: 'returns prototype of eligibility in telehealth',
            parameters: {},
          },
          GETINSURERS: {
            description: 'returns array of insurer organizations (id, name)',
            parameters: {},
          },
          VERIFY: {
            description: 'returns eligility verification results along with copay (insurer_id, subscriber_id, eligibility_status, copay_usd)',
            parameters: {
              patient_family_name: 'required, for patient identification',
              patient_given_name: 'required, for patient identification',
              patient_birth_date: 'required, for patient identification YYYY-MM-DD',
              insurer_id: 'required, id of insurer organization from GETINSURER',
              subscriber_id: 'required, subscriber id assigned to patient by insurer',
            },
          },
        };

        return callback(null, usage);
      }

      case 'SCHEMA': {
        const schema = await fetchPublicJsonAsset(context, SCHEMA);
        return callback(null, schema);
      }

      case 'PROTOTYPE': {
        const prototype = await fetchPublicJsonAsset(context, PROTOTYPE);
        return callback(null, prototype);
      }

      case 'GETINSURERS': {

        const insurers = [
          { insurer_id: 'aetna', insurer_name: 'Aetna' },
          { insurer_id: 'bsbc' , insurer_name: 'Blue Shield Blue Cross' },
          { insurer_id: 'cigna', insurer_name: 'Cigna' },
          { insurer_id: 'uhc'  , insurer_name: 'UnitedHealthcare' },
        ]

        const response = new Twilio.Response();
        response.setStatusCode(200);
        response.appendHeader('Content-Type', 'application/json');
        response.setBody(insurers);
        if (context.DOMAIN_NAME.startsWith('localhost:')) {
          response.appendHeader('Access-Control-Allow-Origin', '*');
          response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
          response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
        }
        return callback(null, response);
      }
      case 'VERIFY': {
        assert(event.subscriber, 'Missing event.subscriber!!!');
        const subscriber = JSON.parse(event.subscriber);
        assert(subscriber.patient_family_name, 'Missing subscriber.patient_family_name!!!');
        assert(subscriber.patient_given_name , 'Missing subscriber.patient_given_name!!!');
        assert(subscriber.patient_birth_date , 'Missing subscriber.patient_birth_date!!!');
        assert(subscriber.insurer_id         , 'Missing subscriber.insurer_id!!!');
        assert(subscriber.subscriber_id      , 'Missing subscriber.subscriber_id!!!');

        const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');

        const resources = await read_fhir(context, TWILIO_SYNC_SID, FHIR_COVERAGE_ELIGIBILITY_RESPONSE);

        const eligibility = resources.map(r => transform_fhir_to_eligibility(r));

        // hard-code to return same eligibility/copay for specified patient_id
        eligibility[0].insurer_id        = subscriber.insurer_id;
        eligibility[0].subscriber_id     = subscriber.subscriber_id;
        eligibility[0].eligiblity_status = 'eligible';

        const response = new Twilio.Response();
        response.setStatusCode(200);
        response.appendHeader('Content-Type', 'application/json');
        response.setBody(eligibility);
        if (context.DOMAIN_NAME.startsWith('localhost:')) {
          response.appendHeader('Access-Control-Allow-Origin', '*');
          response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
          response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
        }
        return callback(null, response);
      }

      default: // unknown action
        throw Error(`Unknown action: ${action}!!!`);
    }

  } catch (err) {
    console.log(THIS, err);
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
}
