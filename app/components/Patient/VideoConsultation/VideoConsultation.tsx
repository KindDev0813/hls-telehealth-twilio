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

export interface VideoConsultationProps {}

export const VideoConsultation = ({}: VideoConsultationProps) => {
  const router = useRouter();
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
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
    visitorParticipant: null
  });

  const [flipCamera, flipCameraEnabled] = useToggleFacingMode();

  useEffect(() => {
    if (room) {
      const providerParticipant = participants[0];

      setCallState(prev => {
        return {
          ...prev,
          patientParticipant: room!.localParticipant,
          providerParticipant: providerParticipant,
          visitorParticipant: participants[1]
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
                  />}
               <div className="absolute top-1 right-1 flex">
                {callState.patientParticipant && <VideoParticipant
                    name={visit.patientName}
                    hasAudio={isAudioEnabled}
                    hasVideo={isVideoEnabled}
                    isOverlap
                    isSelf={true}
                    participant={callState.patientParticipant}
                  /> }
                 {callState.visitorParticipant && <VideoParticipant
                   name="Visitor"
                   hasAudio={isAudioEnabled}
                   hasVideo={isVideoEnabled}
                   isOverlap
                   participant={callState.visitorParticipant}
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
            <div className=" w-full flex-col">
              <div className="relative flex justify-center bg-primary items-center w-full text-white">
                Chat with {visit.ehrProvider.name}
                <div className=" h-10 text-center pt-2 justify-evenly">
                  {isChatWindowOpen && (
                    <button
                      className="absolute right-3"
                      type="button"
                      onClick={() => setIsChatWindowOpen(!isChatWindowOpen)}
                    >
                      <Icon name="close" />
                    </button>
                  )}
                </div>
              </div>
              <Chat
                close={() => setIsChatWindowOpen(false)} 
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
                {callState.patientParticipant && !callState.visitorParticipant && <VideoParticipant
                  name={visit.patientName}
                  hasAudio={isAudioEnabled}
                  hasVideo={isVideoEnabled}
                  isSelf={true}
                  isProvider={false}
                  participant={callState.patientParticipant}
                />}
                {callState.patientParticipant && callState.visitorParticipant &&
                  <div className='flex flex-col flex-wrap overflow-x-auto w-[400px] h-[300px]'>

                    <VideoParticipant
                      name={visit.patientName}
                      hasAudio={isAudioEnabled}
                      hasVideo={isVideoEnabled}
                      isSelf={true}
                      isProvider={false}
                      participant={callState.patientParticipant}
                      carouselScreen
                    />
                    <VideoParticipant
                      name="Visitor"
                      hasAudio={isAudioEnabled}
                      hasVideo={isVideoEnabled}
                      isOverlap
                      isProvider={false}
                      isSelf={false}
                      participant={callState.visitorParticipant}
                      carouselScreen
                    />
                  </div>}
                {callState.providerParticipant && <VideoParticipant
                  name={visit.providerName}
                  hasAudio
                  hasVideo
                  isProvider={true}
                  isSelf={false}
                  participant={callState.providerParticipant}
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
        )):(<>
          <h1 className="text-white">Something went wrong</h1>
          </>)}
      </div>
      <ConnectionIssueModal
        close={() => setConnectionIssueModalVisible(false)}
        isVisible={connectionIssueModalVisible}
      />
      <InviteParticipantModal
        close={toggleInviteModal}
        isVisible={inviteModalVisible}
      />
      <EndCallModal
        close={toggleEndCallModal}
        isVisible={endCallModalVisible}
        isProvider={false}
      />
    </>
  );
};
