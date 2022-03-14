import { LocalParticipant, RemoteParticipant } from "twilio-video";
import { EHRAppointment, EHRPatient } from "./types";

export interface Token {
  passcode: string;
  token: string;
}

export interface PatientAppointment {
  appointment: EHRAppointment;
  patient: EHRPatient;
}

export interface CurrentVisit {
  visitId: string;
  visitType: string;
}

// On Demand Intefaces
export interface OnDemandData {
  appointment: EHRAppointment;
  patient: EHRPatient;
  patientSynctoken: string;
}

export interface PatientInfo {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  needTranslator: string;
  gender: string;
}
interface HealthFile {
  name: string;
  url?: string;
}
export interface HealthInfo {
  conditions: string;
  files?: HealthFile[];
  medications: string;
  reason: string;
}

export interface InsuranceInfo {
  haveInsurance: string;
  memberId: string;
  healthPlan: string;
  isPrimaryMember: string;

}

// Room Interfaces
export interface ParticipantRoomState {
  patientName: string;
  providerName: string;
  visitorName?: string // todo change to array of visitors
}

export interface ProviderRoomState extends ParticipantRoomState {
  patientParticipant: RemoteParticipant;
  providerParticipant: LocalParticipant;
  visitorParticipant?: RemoteParticipant; // todo change to array of visitors
}

export interface PatientRoomState extends ParticipantRoomState {
  patientParticipant: LocalParticipant;
  providerParticipant: RemoteParticipant;
  visitorParticipant?: RemoteParticipant; // todo change to array of visitors
}
