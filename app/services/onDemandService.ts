import { HEALTH_INFO_KEY, PATIENT_INFO_KEY } from "../constants";
import { EHRAppointment, EHRPatient, EHRProvider } from "../types";
import clientStorage from "./clientStorage";
import { Uris } from "./constants";
import datastoreService from "./datastoreService";
import { HealthInfo, PatientAppointment, PatientInfo, Token } from "../interfaces";

export const createEHRPatient = async (token: string): Promise<PatientAppointment> => {
  try {
    // Gets User Information from Local Storage to create Patient
    const [patientInfo, healthInfo] = await Promise.all([
      clientStorage.getFromStorage(PATIENT_INFO_KEY),
      clientStorage.getFromStorage(HEALTH_INFO_KEY),
    ]) as [PatientInfo, HealthInfo];

    const ehrPatient = getEHRPatient(patientInfo, healthInfo);
    
    // combine calls to reduce latency time
    const [provider, patient] = await Promise.all([
      datastoreService.fetchProviderOnCall(token),
      datastoreService.addPatient(token, ehrPatient)
    ]);

    const appointment = getAppointment(provider, patient, healthInfo);
    return {
      appointment,
      patient: ehrPatient
    }
  } catch(err) {
    console.error(err);
  }
}

export const getOnDemandToken = async (patientId = "p1000000", appointmentId = "a1000000"): Promise<Token> => {
  return fetch(Uris.get(Uris.visits.token), {
    method: 'POST',
    body: JSON.stringify({
      role: "patient",
      action: "PATIENT",
      id: patientId,
      visitId: appointmentId // should be generated from EHR
    }),
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
  })
  .then(resp => {
    return resp.json();
  })
  .catch(err => console.log(err));


  
}

const getEHRPatient = (patientInfo: PatientInfo, healthInfo: HealthInfo): EHRPatient => {
  let langOptions = {};

  if(patientInfo.needTranslator === 'Yes') {
      const {needTranslator, language} = patientInfo;
      langOptions = {needTranslator, language};
  }

  return Object.assign({
    name: patientInfo.lastName,
    family_name: patientInfo.lastName,
    given_name: patientInfo.firstName,
    phone: patientInfo.phoneNumber,
    gender: patientInfo.gender,
    conditions: new Array(healthInfo.conditions),
    medications: new Array(healthInfo.medications)
  }, langOptions)
}

const getAppointment = (provider: EHRProvider, patient: EHRPatient, healthInfo: HealthInfo): EHRAppointment => {
  return {
    provider_id: provider.id,
    patient_id: patient.id,
    reason: healthInfo.reason,
    references: [],
  }
}
