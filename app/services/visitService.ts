import { PatientUser, TelehealthUser, TelehealthVisit } from "../types";

const visits = [
  {
    id: 'v-doe-jonson-1121',
    providerName: 'Dr. John Doe',
    patientName: 'Kelly Jonsons',
    roomName: 'v-doe-jonson-1121',
    visitDateTime: new Date()
  } as TelehealthVisit,
  {
    id: 'v-doe-peterson-1121',
    providerName: 'Dr. John Doe',
    patientName: 'Paul Peterson',
    roomName: 'v-doe-peterson-1121',
    visitDateTime: new Date()
  } as TelehealthVisit
];

function getVisits(practitioner: TelehealthUser): Promise<Array<TelehealthVisit> | { error : string }> {
  if(practitioner.role !== 'provider') {
    Promise.reject({ error: "Only provider can get a list of visits" });
  }

  return Promise.resolve(visits);
}

function getVisit(id: string): Promise<TelehealthVisit | { error : string }> {
  return Promise.resolve(visits.find(v => v.id === id));
}

function getVisitForPatient(patient: PatientUser): Promise<TelehealthVisit | { error : string }> {
  return getVisit(patient.visitId);
}

export default {
  getVisits,
  getVisit,
  getVisitForPatient
};