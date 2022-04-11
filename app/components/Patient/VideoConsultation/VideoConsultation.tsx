import React, {useEffect, useState, useRef} from 'react';
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
import {useToggleFacingMode} from "../../Base/VideoProvider/useToggleFacingMode/useToggleFacingMode";
import { PatientRoomState, ChatUser } from '../../../interfaces';
import { RemoteParticipant } from 'twilio-video';
import { roomParticipantsService } from '../../../services/roomParticipantsService';


export interface VideoConsultationProps {}

export const VideoConsultation = ({}: VideoConsultationProps) => {
  const router = useRouter();
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const [dataTrackMessage, setDataTrackMessage] = useState(null);
  const [visitorName, setVisitorName] = useState('Patient Visitor');
  const [providerVisitorName, setProviderVisitorName] = useState('Provider Visitor');
  const [chatUsers, setChatUsers] = useState<ChatUser[]>(null);
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

  const containerRef = useRef(null);


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
    if(!dataTrackMessage) {
      return;
    }

    if(dataTrackMessage.name) {
      if(callState.visitorParticipant && callState.visitorParticipant.identity == dataTrackMessage.participantId) {
        setVisitorName(dataTrackMessage.name);
      }

      if(callState.providerVisitorParticipant && callState.providerVisitorParticipant.identity == dataTrackMessage.participantId) {
        setProviderVisitorName(dataTrackMessage.name);
      }
    }
    setChatUsers(roomParticipantsService.getChatUsers(user, room, participants as RemoteParticipant[], visit, visitorName, providerVisitorName));
  }, [dataTrackMessage]);


  useEffect(() => {
    if (room) {
      const providerParticipant = roomParticipantsService.getProvider(user, room, participants as RemoteParticipant[], visit);
      setCallState(prev => {
        return {
          ...prev,
          patientParticipant: roomParticipantsService.getPatient(user, room, participants as RemoteParticipant[], visit),
          providerParticipant: roomParticipantsService.getProvider(user, room, participants as RemoteParticipant[], visit),
          visitorParticipant: roomParticipantsService.getPatientVisitor(user, room, participants as RemoteParticipant[], visit),
          providerVisitorParticipant: roomParticipantsService.getProviderVisitor(user, room, participants as RemoteParticipant[], visit),
        }

      })

      setChatUsers(roomParticipantsService.getChatUsers(user, room, participants as RemoteParticipant[], visit, visitorName, providerVisitorName));

      const disconnectFromRoom = () => {
        console.log(callState);
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

  let chatHeight = {
    height: '200px'
  };
  if(containerRef && containerRef.current) {
    // todo move top video screen constant to common constants
    chatHeight.height = `${containerRef.current.offsetHeight - 293}px`;
  }

  return (
    <>
      <div
          ref={containerRef}
          className="bg-secondary flex flex-col h-full w-full items-center overflow-x-hidden overflow-y-scroll">
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
                    name={visit.ehrProvider.name}
                    hasAudio
                    hasVideo
                    isProvider={true}
                    isSelf={false}
                    participant={callState.providerParticipant}
                setDataTrackMessage={setDataTrackMessage}
                  />}
               <div className="absolute top-1 right-4 flex">
                {callState.patientParticipant && <VideoParticipant
                    name={`${visit.ehrPatient.given_name} ${visit.ehrPatient.family_name}`}
                    hasAudio={user.role=='patient'?isAudioEnabled:true}
                    hasVideo={user.role=='patient'?isVideoEnabled:true}
                    isOverlap
                    isSelf={user.role=='patient'}
                    participant={callState.patientParticipant}
                    setDataTrackMessage={setDataTrackMessage}
                  /> }
                 {callState.visitorParticipant && <VideoParticipant
                   name={visitorName}
                   hasAudio={user.role=='visitor'?isAudioEnabled:true}
                   hasVideo={user.role=='visitor'?isVideoEnabled:true}
                   isOverlap
                   isSelf={user.role=='visitor'}
                   participant={callState.visitorParticipant}
                   setDataTrackMessage={setDataTrackMessage}
                   /> }
                 {callState.providerVisitorParticipant && <VideoParticipant
                   name={providerVisitorName}
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
            <div className="w-full bottom-0 absolute" style={chatHeight}>
              <Chat
                  close={() => {
                    toggleAudioEnabled();
                    setIsChatWindowOpen(false)
                  }}
                  showHeader
                  otherUser={visit.ehrProvider.name}
                  users={chatUsers}                  
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
                  && <div className={'flex flex-col flex-wrap overflow-x-hidden  w-[400px] ' + ((participantsCount()== 3) ? 'h-[300px]' : 'h-[200px]') }>
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
                      name={visitorName}
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
                      name={providerVisitorName}
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
