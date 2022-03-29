import { Room, TwilioError, RemoteParticipant, LocalParticipant } from 'twilio-video';
import { TelehealthVisit } from '../types';

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
  

export const roomParticipantsService = {
  getProvider,
  getPatient,
  getPatientVisitor,
  getProviderVisitor
}
