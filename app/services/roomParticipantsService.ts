import { Room, TwilioError, RemoteParticipant, LocalParticipant } from 'twilio-video';
import { TelehealthVisit } from '../types';
import { ChatUser } from '../interfaces';


/**
 * service to identify and return participant by role + among local and remote
 * 
 */

function getProvider(user: any, room: Room, participants: Array<RemoteParticipant>, visit: TelehealthVisit ): any {
    return (user.role == 'provider') ? room!.localParticipant
                                     : participants.find(p => p.identity == visit.ehrAppointment.provider_id);
 }

 function getPatient(user: any, room: Room, participants: Array<RemoteParticipant>, visit: TelehealthVisit ): any {
    return (user.role == 'patient') ? room!.localParticipant
                                    : participants.find(p => p.identity == visit.ehrAppointment.patient_id);
}
  
 function getPatientVisitor(user: any, room: Room, participants: Array<RemoteParticipant>, visit: TelehealthVisit ): any {
    return (user.role == 'visitor') ? room!.localParticipant
                                    : participants.find(p => p.identity.startsWith('visitor_'));
}
  
function getProviderVisitor(user: any, room: Room, participants: Array<RemoteParticipant>, visit: TelehealthVisit ): any {
  return (user.role == 'providervisitor') ? room!.localParticipant
                                          : participants.find(p => p.identity.startsWith('providervisitor_'));
}

function getChatUsers(user: any, room: Room, participants: Array<RemoteParticipant>, visit: TelehealthVisit, patientVisitorName: string, providerVisitorName: string): ChatUser[] {

  const users: ChatUser[] = [];
  if(visit.ehrProvider) {
    users.push({id: visit.ehrProvider.id, name: visit.ehrProvider.name});
  }
  if(visit.ehrPatient) {
    users.push({id: visit.ehrPatient.id, name: visit.ehrPatient.given_name + ' ' + visit.ehrPatient.family_name});
  }

  const patientVisitor = getPatientVisitor(user, room, participants as RemoteParticipant[], visit)  
  if(patientVisitor) {
    users.push({id: patientVisitor.identity, name: patientVisitorName});
  }

  const providerVisitor = getProviderVisitor(user, room, participants as RemoteParticipant[], visit)  
  if(providerVisitor) {
    users.push({id: providerVisitor.identity, name: providerVisitorName});
  }
  
  return users;

}


export const roomParticipantsService = {
  getProvider,
  getPatient,
  getPatientVisitor,
  getProviderVisitor,
  getChatUsers
}
