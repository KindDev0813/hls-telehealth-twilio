import React, {useEffect, useState} from 'react';
import {PatientRoomState} from '../../../constants';
import { useVisitContext } from '../../../state/VisitContext';
import useParticipants from '../../Base/VideoProvider/useParticipants/useParticipants';
import useRoomState from '../../Base/VideoProvider/useRoomState/useRoomState';
import useVideoContext from '../../Base/VideoProvider/useVideoContext/useVideoContext';
import { Button, ButtonVariant } from '../../Button';
import { Chat } from '../../Chat';
import { ConnectionIssueModal } from '../../ConnectionIssueModal';
import { InviteParticipantModal } from '../../InviteParticipantModal';
import { PoweredByTwilio } from '../../PoweredByTwilio';
import { VideoControls } from '../../VideoControls';
import { VideoParticipant } from './VideoParticipant';
import useChatContext from '../../Base/ChatProvider/useChatContext/useChatContext';
import useLocalAudioToggle from '../../Base/VideoProvider/useLocalAudioToggle/useLocalAudioToggle';
import useLocalVideoToggle from '../../Base/VideoProvider/useLocalVideoToggle/useLocalVideoToggle';
import useLocalParticipantNetworkQualityLevel from '../../Base/VideoProvider/useLocalParticipantNetworkQualityLevel/useLocalParticipantNetworkQualityLevel';
import { EndCallModal } from '../../EndCallModal';
import { useRouter } from 'next/router';
import { Icon } from '../../Icon';
import {useToggleFacingMode} from "../../Base/VideoProvider/useToggleFacingMode/useToggleFacingMode";
//import useDataTrackMessage from '../../Base/DataTracks/useDataTrackMessage';
//import { DataTrackMessage } from '../../../types';

export interface VideoConsultationProps {}

export const VideoConsultation = ({}: VideoConsultationProps) => {
  const router = useRouter();
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const [dataTrackMessage, setDataTrackMessage] = useState(null);
  const [isVideoEnabled, toggleVideoEnabled] = useLocalVideoToggle();
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [endCallModalVisible, setEndCallModalVisible] = useState(false);
  const [connectionIssueModalVisible, setConnectionIssueModalVisible] = useState(false);
  const roomState = useRoomState();
  const { user, visit } = useVisitContext();
  const participants = useParticipants();
  const { room } = useVideoContext();
  const { setIsChatWindowOpen, isChatWindowOpen } = useChatContext();
  const networkQualityLevel = useLocalParticipantNetworkQualityLevel(room);
  const [connectionIssueTimeout, setConnectionIssueTimeout] = useState(null);

  const [callState, setCallState] = useState<PatientRoomState>({
    patientName: null,
    providerName: null,
    visitorName: null,
    patientParticipant: null,
    providerParticipant: null,
    visitorParticipant: null,
    providerVisitorParticipant: null
  });

  const [flipCamera, flipCameraEnabled] = useToggleFacingMode();

  //handle name for visitiors
  useEffect(() => {
    console.log('dataTrackMessage', dataTrackMessage);

  }, [dataTrackMessage]);
  

  useEffect(() => {
    if (room) {
  
      // //set name for visitors
      // if(user.role == 'visitor' || user.role == 'providervisitor' ) {
      //   // @ts-ignore
      //   const [localDataTrackPublication] = [...room.localParticipant.dataTracks.values()];

      //   const dataTrackMessage: DataTrackMessage  = {participantId: user.id, name: user.name}
      //   localDataTrackPublication.track.send(JSON.stringify(dataTrackMessage));
      // }

      const providerParticipant = participants.find(p => p.identity == visit.ehrAppointment.provider_id);  
      const patientParticipant = 
                        (user.role == 'patient') ? room!.localParticipant : 
                        participants.find(p => p.identity == visit.ehrAppointment.patient_id);
      const visitorParticipant = 
                        (user.role == 'visitor') ? room!.localParticipant : 
                        participants.find(p => p.identity.startsWith('visitor_'));
      const providerVisitorParticipant = 
                        (user.role == 'providervisitor') ? room!.localParticipant : 
                        participants.find(p => p.identity.startsWith('providervisitor_'));

      setCallState(prev => {
        return {
          ...prev,
          patientParticipant: patientParticipant,
          providerParticipant: providerParticipant,
          visitorParticipant: visitorParticipant,
          providerVisitorParticipant: providerVisitorParticipant,
        }
        
      })

      const disconnectFromRoom = () => {
        if (!callState.providerParticipant) {
          room.disconnect();
          router.push('/patient/visit-survey/');
        }
      }

      if (room && providerParticipant) {
        room.on('participantDisconnected', disconnectFromRoom);
        return () => {
          room.off('participantDisconnected', disconnectFromRoom);
        }
      }
    }
  }, [participants, room]);

  useEffect(() => {
    if(networkQualityLevel === 1 || networkQualityLevel === 0) {
      if(!connectionIssueTimeout) {
        setConnectionIssueTimeout(setTimeout(() => setConnectionIssueModalVisible(true), 10000));
      }
    } else {
      if(connectionIssueTimeout) {
        clearTimeout(connectionIssueTimeout);
        setConnectionIssueTimeout(null);
      }
    }
  }, [networkQualityLevel, connectionIssueTimeout]);
  
  function toggleEndCallModal() {
    setEndCallModalVisible(!endCallModalVisible);
  }

  function toggleInviteModal() {
    setInviteModalVisible(!inviteModalVisible);
  }

  function participantsCount() {
    return    (callState.providerParticipant ? 1 : 0)
            + (callState.patientParticipant ? 1 : 0)
            + (callState.visitorParticipant ? 1 : 0)
            + (callState.providerVisitorParticipant ? 1 : 0);
  }
  

  return (
    <>
      <div className="bg-secondary flex flex-col h-full w-full items-center overflow-x-hidden overflow-y-scroll">
        <div className="py-5">
          <PoweredByTwilio inverted />
        </div>        
        { 
          roomState == 'connected' ? (
          isChatWindowOpen ? (
          <>
            <div className="flex">
              <div className="relative">
                {callState.providerParticipant && <VideoParticipant
                    name={visit.providerName}
                    hasAudio
                    hasVideo
                    participant={callState.providerParticipant}
                    setDataTrackMessage={setDataTrackMessage}
                  />}
               <div className="absolute top-1 right-1 flex">
                {callState.patientParticipant && <VideoParticipant
                    name={visit.patientName}
                    hasAudio={user.role=='patient'?isAudioEnabled:true}
                    hasVideo={user.role=='patient'?isVideoEnabled:true}
                    isOverlap
                    isSelf={user.role=='patient'}
                    participant={callState.patientParticipant}
                    setDataTrackMessage={setDataTrackMessage}
                  /> }
                 {callState.visitorParticipant && <VideoParticipant
                   name="Patient Visitor"
                   hasAudio={user.role=='visitor'?isAudioEnabled:true}
                   hasVideo={user.role=='visitor'?isVideoEnabled:true}
                   isOverlap
                   isSelf={user.role=='visitor'}
                   participant={callState.visitorParticipant}
                   setDataTrackMessage={setDataTrackMessage}
                   /> }
                 {callState.providerVisitorParticipant && <VideoParticipant
                   name="Provider Visitor"
                   hasAudio={user.role=='providervisitor'?isAudioEnabled:true}
                   hasVideo={user.role=='providervisitor'?isVideoEnabled:true}
                   isOverlap
                   isSelf={user.role=='providervisitor'}
                   participant={callState.providerVisitorParticipant}
                   setDataTrackMessage={setDataTrackMessage}
                   /> }
                </div>
                <Button
                  className="absolute left-4 bottom-3"
                  icon="chat_bubble"
                  variant={ButtonVariant.tertiary}
                  onClick={() => {
                    // todo https://twilio-healthcare.atlassian.net/browse/THV2-15 temporary fix. Template needs to be rewritten
                    setIsChatWindowOpen(!isChatWindowOpen)
                    toggleAudioEnabled()
                  }}
                />
              </div>
            </div>
            <div className=" w-full flex-col h-[180px]">
              <div className="relative flex justify-center bg-primary items-center w-full text-white">
                Chat with {visit.ehrProvider.name}
                <div className=" h-10 text-center pt-2 justify-evenly">
                  {isChatWindowOpen && (
                    <button
                      className="absolute right-3"
                      type="button"
                      onClick={() => {
                        setIsChatWindowOpen(!isChatWindowOpen)
                        toggleAudioEnabled()
                      }}
                    >
                      <Icon name="close" />
                    </button>
                  )}
                </div>
              </div>
              <Chat
                close={() => {
                  setIsChatWindowOpen(false)
                  toggleAudioEnabled()
                }}
                currentUser={visit.ehrPatient.name}
                otherUser={visit.ehrProvider.name}
                userId={user.id}
                userRole={user.role} 
                inputPlaceholder={`Message to ${visit.ehrProvider.name}`} 
              />
            </div>

          </>
        ) : (
          <>
            <div className="flex-grow">
              <div className="flex flex-col justify-evenly h-full">
                {callState.patientParticipant 
                  && !callState.visitorParticipant 
                  && !callState.providerVisitorParticipant 
                  && <VideoParticipant
                  name={`${visit.ehrPatient.given_name} ${visit.ehrPatient.family_name}`}
                  hasAudio={user.role=='patient'?isAudioEnabled:true}
                  hasVideo={user.role=='patient'?isVideoEnabled:true}
                  isSelf={true}
                  isProvider={false}
                  participant={callState.patientParticipant}
                  setDataTrackMessage={setDataTrackMessage}
                  />}
                {callState.patientParticipant
                  && (callState.visitorParticipant || callState.providerVisitorParticipant)
                  //TODO: should be refactored for more then 4 participants
                  && <div className={'flex flex-col flex-wrap overflow-x-auto  w-[400px] ' + ((participantsCount()== 3) ? 'h-[300px]' : 'h-[200px]') }>
                    {callState.patientParticipant &&
                      <VideoParticipant
                        name={`${visit.ehrPatient.given_name} ${visit.ehrPatient.family_name}`}
                        hasAudio={user.role=='patient'?isAudioEnabled:true}
                        hasVideo={user.role=='patient'?isVideoEnabled:true}
                        isSelf={user.role=='patient'}
                        isProvider={false}
                        participant={callState.patientParticipant}
                        carouselScreen
                        participantsCount={participantsCount()}
                        setDataTrackMessage={setDataTrackMessage}
                        />
                    }
                    {callState.visitorParticipant
                      && <VideoParticipant
                      name="Patient Visitor"
                      hasAudio={user.role=='visitor'?isAudioEnabled:true}
                      hasVideo={user.role=='visitor'?isVideoEnabled:true}
                      isOverlap
                      isProvider={false}
                      isSelf={user.role=='visitor'}
                      participant={callState.visitorParticipant}
                      carouselScreen
                      participantsCount={participantsCount()}
                      setDataTrackMessage={setDataTrackMessage}
                      />
                    }
                    
                    {callState.providerVisitorParticipant
                      && <VideoParticipant
                      name="Provider Visitor"
                      hasAudio={user.role=='providervisitor'?isAudioEnabled:true}
                      hasVideo={user.role=='providervisitor'?isVideoEnabled:true}
                      isOverlap
                      isProvider={false}
                      isSelf={user.role=='providervisitor'}
                      participant={callState.providerVisitorParticipant}
                      carouselScreen
                      participantsCount={participantsCount()}
                      setDataTrackMessage={setDataTrackMessage}
                      />
                    }
                    
                  </div>}
                {callState.providerParticipant && <VideoParticipant
                  name={visit.ehrProvider.name}
                  hasAudio
                  hasVideo
                  isProvider={true}
                  isSelf={false}
                  participant={callState.providerParticipant}
                  setDataTrackMessage={setDataTrackMessage}
                  />}
              </div>
              {isChatWindowOpen && (
                <Button
                  icon="chat_bubble_outline"
                  onClick={() => setIsChatWindowOpen(!isChatWindowOpen)}
                />
              )}
            </div>

            {!isChatWindowOpen &&<VideoControls
              containerClass="mb-5 bg-[#FFFFFF4A] rounded-lg"
              isMuted={!isAudioEnabled}
              isVideoStopped={!isVideoEnabled}
              addParticipant={toggleInviteModal}
              flipCamera={flipCameraEnabled ? flipCamera : null}
              toggleChat={() => {
                setIsChatWindowOpen(!isChatWindowOpen)
                // todo https://twilio-healthcare.atlassian.net/browse/THV2-15 temporary fix. Template needs to be rewritten
                toggleAudioEnabled()
              }}
              toggleVideo={toggleVideoEnabled}
              toggleAudio={toggleAudioEnabled}
              toggleEndCallModal={toggleEndCallModal}
            />}
          </>
        )):(<></>)}
      </div>
      <ConnectionIssueModal
        close={() => setConnectionIssueModalVisible(false)}
        isVisible={connectionIssueModalVisible}
      />
      <InviteParticipantModal
        close={toggleInviteModal}
        isVisible={inviteModalVisible}
        hasNameInput={false}
        role="visitor"
      />
      <EndCallModal
        close={toggleEndCallModal}
        isVisible={endCallModalVisible}
        isProvider={false}
      />
    </>
  );
};
