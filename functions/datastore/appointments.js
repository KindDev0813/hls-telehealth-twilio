/*
 * --------------------------------------------------------------------------------
 * manage appointments including storage to EHR
 *
 * event parameters:
 * .action: USAGE|SCHEMA|PROTOTYPE|GET|GET-PATIENTS|ADD, default USAGE
 * --------------------------------------------------------------------------------
 */

const SCHEMA = '/datastore/appointment-schema.json';
const PROTOTYPE = '/datastore/appointment-prototype.json';
const FHIR_APPOINTMENT = 'Appointments';

const assert = require("assert");
const { getParam } = require(Runtime.getFunctions()['helpers'].path);
const { read_fhir, save_fhir, fetchPublicJsonAsset } = require(Runtime.getFunctions()['datastore/datastore-helpers'].path);

// --------------------------------------------------------------------------------
function transform_fhir_to_appointment(fhir_appointment) {
  const r = fhir_appointment;
  const appointment = {
    appointment_id: r.id,
    appointment_type: r.appointmentType.coding[0].code,
    appointment_start_datetime_utc: r.start,
    appointment_end_datetime_utc: r.end,
    ...(r.reasonCode.length === 1 && { appointment_reason: r.reasonCode[0].text }),
    appointment_references: r.supportingInformation.map(r => r.reference),
    patient_id: r.participant.find(e => e.actor.reference.startsWith('Patient/'))
      .actor.reference.replace('Patient/', ''),
    provider_id: r.participant.find(e => e.actor.reference.startsWith('Practitioner/'))
      .actor.reference.replace('Practitioner/', ''),
  };
  return appointment;
}

// --------------------------------------------------------------------------------
function transform_appointment_to_fhir(appointment) {
  const a = appointment;
  const fhir_appointment = {
    resourceType: 'Appointment',
    id: a.appointment_id,
    supportingInformation: (a.appointment_type === 'WALKIN') ? [] : a.appointment_references,
    status: (a.appointment_type === 'WALKIN') ? 'arrived' : 'booked',
    appointmentType: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v2-0276',
          code: a.appointment_type,
        }
      ]
    },
    reasonCode: [
      {
        text: a.appointment_reason,
      }
    ],
    start: a.appointment_start_datetime_utc,
    end: a.appointment_end_datetime_utc,
    participant: [
      {
        actor: {
          reference: 'Patient/' + a.patient_id
        }
      },
      {
        type: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/encounter-participant-type',
                code: 'ATND,'
              }
            ]
          }
        ],
        actor: {
          reference: 'Practitioner/' + a.provider_id
        }
      }
    ],
  };
  return fhir_appointment;
}


// --------------------------------------------------------------------------------
async function getAll(context) {
  const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');

  let resources = await read_fhir(context, TWILIO_SYNC_SID, FHIR_APPOINTMENT);

  const appointments = resources
    .map(r => transform_fhir_to_appointment(r))
    .sort((a, b) => {
      return a.appointment_start_datetime_utc.localeCompare(b.appointment_start_datetime_utc);
    });

  // rebase time where first (earliest) appointment is 5min past current time
  const first_appointment_ts = new Date(appointments[0].appointment_start_datetime_utc);
  const diff = new Date().getTime() - first_appointment_ts.getTime() - 5*60*1000;
  appointments.forEach(appt => {
    const start_ts = new Date(appt.appointment_start_datetime_utc);
    const end_ts = new Date(appt.appointment_end_datetime_utc);
    appt.appointment_start_datetime_utc = new Date(start_ts.getTime() + diff).toISOString();
    appt.appointment_end_datetime_utc = new Date(end_ts.getTime() + diff).toISOString();
  });

  return appointments;
}
exports.getAll = getAll;


// --------------------------------------------------------------------------------
exports.handler = async function(context, event, callback) {
  const THIS = 'appointments:';
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
        delete prototype.appointment_id;
        delete prototype.appointment_type;
        delete prototype.appointment_start_datetime_utc;
        delete prototype.appointment_end_datetime_utc;

        const usage = {
          action: 'usage for appointments function',
          USAGE: {
            description: 'returns function signature, default action',
            parameters: {},
          },
          SCHEMA: {
            description: 'returns json schema for appointment in telehealth',
            parameters: {},
          },
          PROTOTYPE: {
            description: 'returns prototype of appointment in telehealth',
            parameters: {},
          },
          GET: {
            description: 'returns array of appointment',
            parameters: {
              appointment_id: 'optional, filters for specified appointment. will return zero or one',
              patient_id: 'optional, filters for specified patient',
              provider_id: 'optional, filters for specified provider',
            }
          },
          GETTUPLE: {
            description: 'returns array of appointment/patient/provider tuple',
            parameters: {
              appointment_id: 'optional, filters for specified appointment. will return zero or one',
              patient_id: 'optional, filters for specified patient',
              provider_id: 'optional, filters for specified provider',
            }
          },
          ADD: {
            description: 'add a new appointment',
            parameters: {
              appointment: prototype,
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

        let appointments = all;
        appointments = event.appointment_id ? appointments.filter(a => a.appointment_id === event.appointment_id) : appointments;
        appointments = event.patient_id ? appointments.filter(a => a.patient_id === event.patient_id) : appointments;
        appointments = event.provider_id ? appointments.filter(a => a.provider_id === event.provider_id) : appointments;

        console.log(THIS, `GET retrieved ${appointments.length} appointments
        for ${event.appointment_id ? 'appointment_id=' + event.appointment_id : ' all appointments'},
        for ${event.patient_id ? 'patient_id=' + event.patient_id : ' all patients'},
        for ${event.provider_id ? 'provider_id=' + event.provider_id : ' all providers'}`);
        const response = new Twilio.Response();
        response.setStatusCode(200);
        response.appendHeader('Content-Type', 'application/json');
        response.setBody(appointments);
        if (context.DOMAIN_NAME.startsWith('localhost:')) {
          response.appendHeader('Access-Control-Allow-Origin', '*');
          response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
          response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
        }
        return callback(null, response);
      }

      case 'GETTUPLE': {
        const patientAccessor = require(Runtime.getFunctions()['datastore/patients'].path);
        const providerAccessor = require(Runtime.getFunctions()['datastore/providers'].path);

        const all = await getAll(context);

        let appointments = all;
        appointments = event.appointment_id ? appointments.filter(a => a.appointment_id === event.appointment_id) : appointments;
        appointments = event.patient_id ? appointments.filter(a => a.patient_id === event.patient_id) : appointments;
        appointments = event.provider_id ? appointments.filter(a => a.provider_id === event.provider_id) : appointments;

        console.log(THIS, `GETTUPLE retrieved ${appointments.length} appointments
        for ${event.appointment_id ? 'appointment_id=' + event.appointment_id : ' all appointments'},
        for ${event.patient_id ? 'patient_id=' + event.patient_id : ' all patients'},
        for ${event.provider_id ? 'provider_id=' + event.provider_id : ' all providers'}`);

        const all_patients = await patientAccessor.getAll(context);
        const all_providers = await providerAccessor.getAll(context);

        const tuple = [];
        appointments.forEach(appt => {
          tuple.push({
            appointment: appt,
            patient: all_patients.find(p => p.patient_id === appt.patient_id),
            provider: all_providers.find(p => p.provider_id === appt.provider_id),
          })
        });

        const response = new Twilio.Response();
        response.setStatusCode(200);
        response.appendHeader('Content-Type', 'application/json');
        response.setBody(tuple);
        if (context.DOMAIN_NAME.startsWith('localhost:')) {
          response.appendHeader('Access-Control-Allow-Origin', '*');
          response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
          response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
        }
        return callback(null, response);
      }

      case 'ADD': {
        assert(event.appointment, 'Missing event.appointment!!!');
        const appointment = event.appointment;
        assert(appointment.appointment_reason, 'Missing appointment_reason!!!');
        assert(appointment.appointment_references, 'Missing appointment_references!!!');
        assert(appointment.patient_id, 'Missing patient_id!!!');
        assert(appointment.provider_id, 'Missing provider_id!!!');
        const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');

        const now = new Date();
        appointment.appointment_id = 'a' + (now.getTime());
        appointment.appointment_type = 'WALKIN';
        appointment.appointment_start_datetime_utc = now.toISOString();
        appointment.appointment_end_datetime_utc = new Date(now.getTime() + 1000*60*30).toISOString();

        const fhir_appointment = transform_appointment_to_fhir(appointment);

        const resources = await read_fhir(context, TWILIO_SYNC_SID, FHIR_APPOINTMENT);
        resources.push(fhir_appointment);

        await save_fhir(context, TWILIO_SYNC_SID, FHIR_APPOINTMENT, resources);

        console.log(THIS, `added appointment ${appointment.appointment_id}`);
        const response = new Twilio.Response();
        response.setStatusCode(200);
        response.appendHeader('Content-Type', 'application/json');
        response.setBody(appointment);
        if (context.DOMAIN_NAME.startsWith('localhost:')) {
          response.appendHeader('Access-Control-Allow-Origin', '*');
          response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
          response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
        }
        return callback(null, response);
      }

      case 'REMOVE': {
        assert(event.appointment_id, 'Missing event.appointment_id!!!');
        const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');

        const resources = await read_fhir(context, TWILIO_SYNC_SID, FHIR_APPOINTMENT);
        const remainder = resources.filter(r => r.id !== event.appointment_id);
        await save_fhir(context, TWILIO_SYNC_SID, FHIR_APPOINTMENT, remainder);

        console.log(THIS, `removed appointment ${event.appointment_id}`);
        const response = new Twilio.Response();
        response.setStatusCode(200);
        response.appendHeader('Content-Type', 'application/json');
        response.setBody({ appointment_id : event.appointment_id });
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
