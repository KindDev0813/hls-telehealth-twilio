/* --------------------------------------------------------------------------------------------------------------
 * encapsulation of server datastore functions
 * --------------------------------------------------------------------------------------------------------------
 */
import { EHRPatient, EHRProvider, EHRContent, EHRAppointment, ProviderUser, TelehealthUser, TelehealthVisit, PostVisitSurvey } from "../types";
import { Uris } from "./constants";
const assert = require('assert');

function instantiatePatient(data: any) : EHRPatient {
  return {
    id: data.patient_id,
    name: data.patient_name,
    family_name: data.patient_family_name,
    given_name: data.patient_given_name,
    phone: data.patient_phone,
    ...(data.patient_email && { email: data.patient_email }),
    gender: data.patient_gender,
    ...(data.patient_language && { language: data.patient_language }),
    medications: data.patient_medications,
    conditions: data.patient_conditions,
  } as EHRPatient;
}

function instantiateProvider(data: any) : EHRProvider {
  return {
    id: data.provider_id,
    name: data.provider_name,
    phone: data.provider_phone,
    on_call: new Boolean(data.provider_on_call),
  } as EHRProvider;
}

function instantiateAppointment(data: any) : EHRAppointment {
  return {
    id: data.appointment_id,
    type: data.appointment_type,
    start_datetime_ltz: new Date(data.appointment_start_datetime_utc),
    end_datetime_ltz: new Date(data.appointment_end_datetime_utc),
    ...(data.appointment_reason && { reason: data.appointment_reason }),
    references: data.appointment_references,
    patient_id: data.patient_id,
    provider_id: data.provider_id,
  } as EHRAppointment;
}

function instantiateContent(data: any) : EHRContent {
  return {
    id: data.content_id,
    title: data.content_title,
    ...(data.content_description && { description: data.content_description }),
    video_url: data.content_video_url,
    provider_ids: data.providers.map(e => { return e; }),
  } as EHRContent;
}


/* --------------------------------------------------------------------------------------------------------------
 * fetch TelehealthVists for the specified provider from server datastore
 *
 * result is ordered in ascending order of appointment start time
 * --------------------------------------------------------------------------------------------------------------
 */
async function fetchAllTelehealthVisits(provider: ProviderUser): Promise<Array<TelehealthVisit>> {
  if(provider.role !== 'provider') {
    Promise.reject({ error: "Only provider can get patient queue" });
  }
  const tuple = await fetch(Uris.backendRoot + '/datastore/appointments', {
    method: 'POST',
    body: JSON.stringify({ action: 'GETTUPLE', provider_id: provider.id, token: provider.token }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.token}`
    }
  }).then((r) => r.json());

  const result: TelehealthVisit[] = [];
  tuple.forEach((t) => {
    const patient = instantiatePatient(t.patient);
    const provider = instantiateProvider(t.provider);
    const appointment = instantiateAppointment(t.appointment);
    const tv = {
      id: appointment.id,
      roomName: appointment.id,
      ehrAppointment: appointment,
      ehrPatient: patient,
      ehrProvider: provider,
    } as TelehealthVisit;
    result.push(tv);
    //console.log(tv);
  });

  return Promise.resolve(result);
}

/* --------------------------------------------------------------------------------------------------------------
 * fetch TelehealthVisit for the specified appointment id from server datastore
 * --------------------------------------------------------------------------------------------------------------
 */
async function fetchTelehealthVisitForPatient(user: TelehealthUser, appointment_id: string): Promise<TelehealthVisit | { error : string }> {
  const tuple = await fetch(Uris.backendRoot + '/datastore/appointments', {
    method: 'POST',
    body: JSON.stringify({ action: 'GETTUPLE', appointment_id: appointment_id, token: user.token }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`
    }
  }).then((r) => r.json());

  if(tuple.length === 0) {
    Promise.reject({ error: `not found appointment: ${appointment_id}` });
  }

  const _patient = instantiatePatient(tuple[0].patient);
  const _provider = instantiateProvider(tuple[0].provider);
  const _appointment = instantiateAppointment(tuple[0].appointment);
  const result = {
    id: _appointment.id,
    roomName: _appointment.id,
    ehrAppointment: _appointment,
    ehrPatient: _patient,
    ehrProvider: _provider,
  } as TelehealthVisit;

  //console.log(result);
  return Promise.resolve(result);
}


/* --------------------------------------------------------------------------------------------------------------
 * fetch the all waiting room content from server datastore
 *
 * return content assigned to specified provider first
 * --------------------------------------------------------------------------------------------------------------
 */
async function fetchAllContent(provider: ProviderUser): Promise<Array<EHRContent>> {
  const tuple = await fetch(Uris.backendRoot + '/datastore/contents', {
    method: 'POST',
    body: JSON.stringify({ action: 'GET', token: provider.token }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.token}`
    }
  }).then((r) => r.json());

  const allContent : EHRContent [] = tuple.map((t) => instantiateContent(t));
  console.log(allContent);
  const assignedContent : EHRContent = allContent.find((c) => {
    console.log(provider.id);
    return c.provider_ids.some((p) => p === provider.id);
  });

  const result : EHRContent[] = [];
  result.push(assignedContent);
  for(const c of allContent) {
    if (c.id === assignedContent.id) continue;
    result.push(c);
   }

  return Promise.resolve(result);
}

/* --------------------------------------------------------------------------------------------------------------
 * fetch the waiting room content for the specified provider from server datastore
 * --------------------------------------------------------------------------------------------------------------
 */
async function fetchContentForPatient(patient: TelehealthUser, provider_id): Promise<EHRContent> {
  const tuple = await fetch(Uris.backendRoot + '/datastore/contents', {
    method: 'POST',
    body: JSON.stringify({ action: 'GET', provider_id: provider_id, token: patient.token }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${patient.token}`
    }
  }).then((r) => r.json());

  if(tuple.length === 0) {
    Promise.reject({ error: 'not found any content' });
  }

  const _content = instantiateContent(tuple[0]);

  return Promise.resolve(_content);
}


/* --------------------------------------------------------------------------------------------------------------
 * assign waiting room content to the specified provider
 * --------------------------------------------------------------------------------------------------------------
 */
async function assignContentToProvider(content_id: string, provider: ProviderUser): Promise<string> {
  const tuple = await fetch(Uris.backendRoot + '/datastore/contents', {
    method: 'POST',
    body: JSON.stringify({
      action: 'ASSIGN',
      content_id: content_id,
      provider_id: provider.id,
      token: provider.token
    }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.token}`
    }
  }).then((r) => r.json());

  return Promise.resolve(content_id);
}


/* --------------------------------------------------------------------------------------------------------------
 * fetch provider on call (for on-demand patients).
 *
 * there can be only 1 provider
 * --------------------------------------------------------------------------------------------------------------
 */
async function fetchProviderOnCall(token: string): Promise<EHRProvider> {
  const tuple = await fetch(Uris.backendRoot + '/datastore/providers', {
    method: 'POST',
    body: JSON.stringify({ action: 'GETONCALL', token }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((r) => r.json());

  if (tuple.length === 0) {
    Promise.reject({ error: 'No on-call provider found, error in EHR data!!!' });
  }

  const _provider = instantiateProvider(tuple[0]);

  return Promise.resolve(_provider);
}


/* --------------------------------------------------------------------------------------------------------------
 * create new patient
 * --------------------------------------------------------------------------------------------------------------
 */
async function addPatient(token: string, ehrPatient: EHRPatient): Promise<EHRPatient> {

  assert(ehrPatient.family_name, 'Missing family_name!!!');
  assert(ehrPatient.given_name, 'Missing given_name!!!');
  assert(ehrPatient.phone, 'Missing phone!!!');

  const _patientData = {
    patient_name: ehrPatient.given_name + " " + ehrPatient.family_name,
    patient_family_name: ehrPatient.family_name,
    patient_given_name: ehrPatient.given_name,
    patient_phone: ehrPatient.phone,
    ...(ehrPatient.phone && { patient_phone: ehrPatient.phone }),
    ...(ehrPatient.email && { patient_email: ehrPatient.email }),
    patient_gender: ehrPatient.gender,
    patient_language: ehrPatient.language ?  ehrPatient.language : 'English',
    patient_medications: ehrPatient.medications ? ehrPatient.medications: [],
    patient_conditions: ehrPatient.conditions ? ehrPatient.conditions : [],
  };

  const newPatientData = await fetch(Uris.backendRoot + '/datastore/patients', {
    method: 'POST',
    body: JSON.stringify({ action: 'ADD', patient: _patientData, token }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(async (r) => await r.json());

  if (! newPatientData) {
    Promise.reject({ error: 'Unable to create new patient in EHR!!!' });
  }

  const newEHRPatient = instantiatePatient(newPatientData);

  return Promise.resolve(newEHRPatient);
}


/* --------------------------------------------------------------------------------------------------------------
 * create new appointment
 * --------------------------------------------------------------------------------------------------------------
 */
async function addAppointment(token: string, ehrAppointment: EHRAppointment): Promise<EHRAppointment> {

  assert(ehrAppointment.patient_id, 'Missing patient_id!!!');
  assert(ehrAppointment.provider_id, 'Missing provider_id!!!');

  const _appointmentData = {
    patient_id: ehrAppointment.patient_id,
    provider_id: ehrAppointment.provider_id,
    ...(ehrAppointment.reason && { appointment_reason: ehrAppointment.reason }),
    ...(ehrAppointment.references && { appointment_references: ehrAppointment.references }),
  };

  const newAppointmentData = await fetch(Uris.backendRoot + '/datastore/appointments', {
    method: 'POST',
    body: JSON.stringify({ action: 'ADD', appointment: _appointmentData, token }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((r) => r.json());

  if (! newAppointmentData) {
    Promise.reject({ error: 'Unable to create new appointment in EHR!!!' });
  }

  const newEhrAppointment = instantiateAppointment(newAppointmentData);

  return Promise.resolve(newEhrAppointment);
}

async function completeRoom(token: string, roomSid: string) {
  const resp = await fetch(Uris.get(Uris.visits.completeRoom), {
    method: 'POST',
    body: JSON.stringify({roomSid}),
    headers: { 
        authorization: `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
  })
  .then(r => r.json())
  .catch(err => console.error(err));
  return resp.data;
}

/* --------------------------------------------------------------------------------------------------------------
 * add new post visit survey
 * --------------------------------------------------------------------------------------------------------------
 */
async function addSurvey(token: string, survey: PostVisitSurvey): Promise<PostVisitSurvey[]> {
  if (token == null) throw new Error("Unauthorized: Token is either null or undefined!");
  if (survey == null) throw new Error("Survey is null or undefined!");
  
  const surveyResponse = fetch(Uris.backendRoot + '/datastore/surveys', {
    method: 'POST',
    body: JSON.stringify({ action: 'ADD', survey, token }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(res => res.json());

  if (!surveyResponse) {
    Promise.reject({ error: "Unable to add post visit survey!"});
  }

  return Promise.resolve(surveyResponse);
}

async function getSurveys(token: string): Promise<PostVisitSurvey[]> {
  if (token == null) throw new Error("Unauthorized: Token is either null or undefined!");
  
  const surveys = fetch(Uris.backendRoot + '/datastore/surveys', {
    method: 'POST',
    body: JSON.stringify({ action: 'GET', token }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(res => res.json());

  if (!surveys) {
    Promise.reject({ error: "Unable to add post visit survey!"});
  }

  return Promise.resolve(surveys);
}

export default {
  fetchAllTelehealthVisits,
  fetchTelehealthVisitForPatient,
  fetchAllContent,
  fetchContentForPatient,
  assignContentToProvider,
  fetchProviderOnCall,
  addPatient,
  addAppointment,
  addSurvey,
  getSurveys,
  completeRoom
};