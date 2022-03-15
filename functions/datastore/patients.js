/*
 * --------------------------------------------------------------------------------
 * manage patients including storage to EHR
 *
 * event parameters:
 * .action: USAGE|SCHEMA|PROTOTYPE|GET|ADD, default USAGE
 * --------------------------------------------------------------------------------
 */

const SCHEMA = '/datastore/patient-schema.json';
const PROTOTYPE = '/datastore/patient-prototype.json';
const FHIR_PATIENT = 'Patients';
const FHIR_MEDICATION_STATEMENT = 'MedicationStatements';
const FHIR_CONDITION = 'Conditions';

const assert = require("assert");
const { getParam } = require(Runtime.getFunctions()['helpers'].path);
const { read_fhir, save_fhir, fetchPublicJsonAsset } = require(Runtime.getFunctions()['datastore/datastore-helpers'].path);

// --------------------------------------------------------------------------------
function transform_fhir_to_patient(fhir_patient, fhir_medication_statements, fhir_conditions) {
  const r = fhir_patient;

  const pid = 'Patient/' + r.id;
  const patient = {
    patient_id: r.id,
    patient_name: r.name[0].text,
    ...(r.name[0].family && { patient_family_name: r.name[0].family }),
    patient_given_name: r.name[0].given[0],
    patient_phone: r.telecom[0].value,
    patient_gender: r.gender.charAt(0).toUpperCase() + r.gender.slice(1),
    patient_language: r.communication[0].language.text,
    patient_medications: fhir_medication_statements
      .filter(e => e.subject.reference === pid)
      .map(m => m.medicationCodeableConcept.text),
    patient_conditions: fhir_conditions
      .filter(e => e.subject.reference === pid)
      .map(m => m.code.text)
  };

  return patient;
}

// --------------------------------------------------------------------------------
function transform_patient_to_fhir(patient) {
  const p = patient;
  const pid = 'Patient/' + p.patient_id;

  const fhir_patient = {
    resourceType: 'Patient',
    id: p.patient_id,
    name: [
      {
        use: 'official',
        text: p.patient_name,
        family: p.patient_family_name,
        given: [ p.patient_given_name ]
      }
    ],
    telecom: [
      {
        system: 'sms',
        value: p.patient_phone,
        use: 'mobile'
      },
      // ...(p.patient_email !== undefined
      //   && {
      //     system: 'email',
      //     value: p.patient_email,
      //     use: 'home'
      //   }
      // ),
    ],
    gender: p.patient_gender,
    communication: [
      {
        language: {
          text: p.patient_language
        },
        preferred: true
      }
    ]
  };

  const fhir_medication_statements = p.patient_medications.map(e => {
    return {
      resourceType: 'MedicationStatement',
      medicationCodeableConcept: {
        text: e
      },
      status: 'active',
      subject: {
        reference: pid
      }
    };
  });

  const fhir_conditions = p.patient_conditions.map(e => {
    return {
      resourceType: 'Condition',
      code: {
        text: e
      },
      subject: {
        reference: pid
      }
    };
  });

  console.log(fhir_patient);
  console.log(fhir_medication_statements);
  console.log(fhir_conditions);
  return {
    fhir_patient,
    fhir_medication_statements,
    fhir_conditions,
  }
}


// --------------------------------------------------------------------------------
async function getAll(context) {
  const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');

  let resources = await read_fhir(context, TWILIO_SYNC_SID, FHIR_PATIENT);
  const medication_statements = await read_fhir(context, TWILIO_SYNC_SID, FHIR_MEDICATION_STATEMENT);
  const conditions = await read_fhir(context, TWILIO_SYNC_SID, FHIR_CONDITION);

  const patients = resources.map(r => transform_fhir_to_patient(r, medication_statements, conditions));

  return patients;
}
exports.getAll = getAll;


// --------------------------------------------------------------------------------
exports.handler = async function(context, event, callback) {
  const THIS = 'patients:';
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
        delete prototype.patient_id;

        const usage = {
          action: 'usage for patients function',
          USAGE: {
            description: 'returns function signature, default action',
            parameters: {},
          },
          SCHEMA: {
            description: 'returns json schema for patient in telehealth',
            parameters: {},
          },
          PROTOTYPE: {
            description: 'returns prototype of patient in telehealth',
            parameters: {},
          },
          GET: {
            description: 'returns array of patient',
            parameters: {
              patient_id: 'optional, filters for specified patient. will return zero or one',
            },
          },
          ADD: {
            description: 'add a new patient',
            parameters: {
              patient: prototype,
            },
          },
          REMOVE: {
            description: 'removes an existing patient',
            parameters: {
              patient_id: 'required, patient_id to remove',
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

      case 'GET': {
        const all = await getAll(context);

        const patients = event.patient_id ? all.filter(p => p.patient_id === event.patient_id) : all;

        console.log(THIS, `retrieved ${patients.length} patients`);
        const response = new Twilio.Response();
        response.setStatusCode(200);
        response.appendHeader('Content-Type', 'application/json');
        response.setBody(patients);
        if (context.DOMAIN_NAME.startsWith('localhost:')) {
          response.appendHeader('Access-Control-Allow-Origin', '*');
          response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
          response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
        }
        return callback(null, response);
      }

      case 'ADD': {
        assert(event.patient, 'Missing event.patient!!!');
        const patient = event.patient;
        assert(patient.patient_name, 'Missing patient_name!!!');
        assert(patient.patient_family_name, 'Missing patient_family_name!!!');
        assert(patient.patient_given_name, 'Missing patient_given_name!!!');
        assert(patient.patient_phone, 'Missing patient_phone!!!');
        assert(patient.patient_gender, 'Missing patient_gender!!!');
        assert(patient.patient_language, 'Missing patient_language!!!');
        assert(patient.patient_medications, 'Missing patient_medications!!!');
        assert(patient.patient_conditions, 'Missing patient_conditions!!!');
        const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');

        const now = new Date();
        patient.patient_id = 'p' + (now.getTime());

        const added = transform_patient_to_fhir(patient);

        const current_patients = await read_fhir(context, TWILIO_SYNC_SID, FHIR_PATIENT);
        const current_medications = await read_fhir(context, TWILIO_SYNC_SID, FHIR_MEDICATION_STATEMENT);
        const current_conditions = await read_fhir(context, TWILIO_SYNC_SID, FHIR_CONDITION);

        new_patients = current_patients.concat(added.fhir_patient);
        new_medications = current_medications.concat(added.fhir_medication_statements);
        new_conditions = current_conditions.concat(added.fhir_conditions);

        await save_fhir(context, TWILIO_SYNC_SID, FHIR_PATIENT, new_patients);
        await save_fhir(context, TWILIO_SYNC_SID, FHIR_MEDICATION_STATEMENT, new_medications);
        await save_fhir(context, TWILIO_SYNC_SID, FHIR_CONDITION, new_conditions);

        console.log(THIS, `added content ${patient.patient_id}`);
        const response = new Twilio.Response();
        response.setStatusCode(200);
        response.appendHeader('Content-Type', 'application/json');
        response.setBody(patient);
        if (context.DOMAIN_NAME.startsWith('localhost:')) {
          response.appendHeader('Access-Control-Allow-Origin', '*');
          response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
          response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
        }
        return callback(null, response);
      }

      case 'REMOVE': {
        assert(event.patient_id, 'Missing event.patient_id!!!');
        const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');

        const current_patients = await read_fhir(context, TWILIO_SYNC_SID, FHIR_PATIENT);
        const current_medications = await read_fhir(context, TWILIO_SYNC_SID, FHIR_MEDICATION_STATEMENT);
        const current_conditions = await read_fhir(context, TWILIO_SYNC_SID, FHIR_CONDITION);

        const pid = 'Patient/' + event.patient_id;
        assert(current_patients.some(r => r.id === event.patient_id), `Unable to find patient: ${event.patient_id}`);

        const new_patients = current_patients.filter(r => r.id !== event.patient_id);
        const new_medications = current_medications.filter(r => r.subject.reference !== pid);
        const new_conditions = current_conditions.filter(r => r.subject.reference !== pid);

        await save_fhir(context, TWILIO_SYNC_SID, FHIR_PATIENT, new_patients);
        await save_fhir(context, TWILIO_SYNC_SID, FHIR_MEDICATION_STATEMENT, new_medications);
        await save_fhir(context, TWILIO_SYNC_SID, FHIR_CONDITION, new_conditions);

        console.log(THIS, `removed patient ${event.patient_id}`);
        const response = new Twilio.Response();
        response.setStatusCode(200);
        response.appendHeader('Content-Type', 'application/json');
        response.setBody({ patient_id : event.patient_id });
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
};
