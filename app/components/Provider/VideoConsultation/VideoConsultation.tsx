import React, { useCallback, useEffect, useState } from 'react';
import { joinClasses } from '../../../utils';
import useParticipants from '../../Base/VideoProvider/useParticipants/useParticipants';
import useVideoContext from '../../Base/VideoProvider/useVideoContext/useVideoContext';
import { Chat } from '../../Chat';
import { ConnectionIssueModal } from '../../ConnectionIssueModal';
import { PoweredByTwilio } from '../../PoweredByTwilio';
import { VideoControls } from '../../VideoControls';
import { InviteParticipantPopover } from './InviteParticipantPopover';
import { SettingsPopover } from './SettingsPopover';
import { VideoParticipant } from './VideoParticipant';
import { STORAGE_VISIT_KEY } from '../../../constants';
import useChatContext from '../../Base/ChatProvider/useChatContext/useChatContext';
import { useVisitContext } from '../../../state/VisitContext';
import useLocalAudioToggle from '../../Base/VideoProvider/useLocalAudioToggle/useLocalAudioToggle';
import useLocalVideoToggle from '../../Base/VideoProvider/useLocalVideoToggle/useLocalVideoToggle';
import { roomService } from '../../../services/roomService';
import useSelectedParticipant from '../../Base/VideoProvider/useSelectedParticipant/useSelectedParticipant';
import { RemoteParticipant } from 'twilio-video';
import { EndCallModal } from '../../EndCallModal';
import clientStorage from '../../../services/clientStorage';
import { TelehealthVisit, DataTrackMessage } from '../../../types';
import { InviteParticipantModal } from '../../InviteParticipantModal';
import { roomParticipantsService } from '../../../services/roomParticipantsService';
import { ProviderRoomState, ChatUser } from '../../../interfaces';

export interface VideoConsultationProps {}

export const VideoConsultation = ({}: VideoConsultationProps) => {
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const [isVideoEnabled, toggleVideoEnabled] = useLocalVideoToggle();
  const [inviteModalRef, setInviteModalRef] = useState(null);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [dataTrackMessage, setDataTrackMessage] =
    useState<DataTrackMessage>(null);
  const [visitorName, setVisitorName] = useState('Patient Visitor');
  const [providerVisitorName, setProviderVisitorName] =
    useState('Provider Visitor');
  const [chatUsers, setChatUsers] = useState<ChatUser[]>(null);
  const [endCallModalVisible, setEndCallModalVisible] = useState(false);
  const [settingsModalRef, setSettingsModalRef] = useState(null);
  const [connectionIssueModalVisible, setConnectionIssueModalVisible] =
    useState(false);
  const participants = useParticipants();
  const { setIsChatWindowOpen, isChatWindowOpen } = useChatContext();
  const { user } = useVisitContext();
  const { room, isRecording, toggleScreenShare } = useVideoContext();
  const [selectedParticipant, setSelectedParticipant] =
    useSelectedParticipant();
  const [visit, setVisit] = useState<TelehealthVisit>(null);
  const [callState, setCallState] = useState<ProviderRoomState>({
    patientName: null,
    providerName: null,
    visitorName: null,
    patientParticipant: null,
    providerParticipant: null,
    visitorParticipant: null,
    providerVisitorParticipant: null,
  });

  function toggleInviteModal() {
    setInviteModalVisible(!inviteModalVisible);
  }

  useEffect(() => {
    const getVisit = async () => {
      setVisit(await clientStorage.getFromStorage(STORAGE_VISIT_KEY));
    };
    getVisit();
  }, []);

  //handle name for visitors
  useEffect(() => {
    if (!dataTrackMessage) {
      return;
    }

    if (dataTrackMessage.name) {
      if (
        callState.visitorParticipant &&
        callState.visitorParticipant.identity == dataTrackMessage.participantId
      ) {
        setVisitorName(dataTrackMessage.name);
      }

      if (
        callState.providerVisitorParticipant &&
        callState.providerVisitorParticipant.identity ==
          dataTrackMessage.participantId
      ) {
        setProviderVisitorName(dataTrackMessage.name);
      }

      setChatUsers(
        roomParticipantsService.getChatUsers(
          user,
          room,
          participants as RemoteParticipant[],
          visit,
          visitorName,
          providerVisitorName
        )
      );
    }
  }, [dataTrackMessage]);

  function toggleEndCallModal() {
    setEndCallModalVisible(!endCallModalVisible);
  }

  useEffect(() => {
    if (room) {
      setCallState((prev) => {
        return {
          ...prev,
          patientParticipant: roomParticipantsService.getPatient(
            user,
            room,
            participants as RemoteParticipant[],
            visit
          ),
          providerParticipant: roomParticipantsService.getProvider(
            user,
            room,
            participants as RemoteParticipant[],
            visit
          ),
          visitorParticipant: roomParticipantsService.getPatientVisitor(
            user,
            room,
            participants as RemoteParticipant[],
            visit
          ),
          providerVisitorParticipant:
            roomParticipantsService.getProviderVisitor(
              user,
              room,
              participants as RemoteParticipant[],
              visit
            ),
        };
      });

      setChatUsers(
        roomParticipantsService.getChatUsers(
          user,
          room,
          participants as RemoteParticipant[],
          visit,
          visitorName,
          providerVisitorName
        )
      );
    }
  }, [participants, room]);

  const toggleRecordingCb = useCallback(
    async () =>
      await roomService.toggleRecording(
        user,
        room.sid,
        isRecording ? 'stop' : 'start'
      ),
    [user, room, isRecording]
  );

  const titleStyles = { left: '40%' };
  // todo need to render previous speaker in block with all other participants
  const mainDisplayedParticipant =
    (selectedParticipant as RemoteParticipant) || callState.patientParticipant;

  return (
    <div className="relative h-full">
      <h1
        className="absolute text-white text-2xl font-bold top-4 z-10"
        style={titleStyles}
      >
        Cloud City Healthcare
      </h1>
      <div
        className={joinClasses(
          'bg-secondary flex flex-col h-full w-full items-center',
          isRecording ? 'border-[10px] border-primary' : 'p-[10px]'
        )}
      >
        <div className="absolute right-6 min-w-[12rem] w-[15%] h-[16%] flex flex-col z-20">
          {callState.providerParticipant && (
            <VideoParticipant
              name={visit.ehrProvider.name}
              hasAudio={isAudioEnabled}
              hasVideo={isVideoEnabled}
              isProvider
              isSelf
              participant={callState.providerParticipant}
              fullScreen
              setDataTrackMessage={setDataTrackMessage}
            />
          )}
          {callState.visitorParticipant && (
            <VideoParticipant
              name={visitorName}
              hasAudio
              hasVideo
              participant={callState.visitorParticipant}
              fullScreen
              setDataTrackMessage={setDataTrackMessage}
            />
          )}
          {callState.providerVisitorParticipant && (
            <VideoParticipant
              name={providerVisitorName}
              hasAudio
              hasVideo
              participant={callState.providerVisitorParticipant}
              fullScreen
              setDataTrackMessage={setDataTrackMessage}
            />
          )}
        </div>

        <div className="w-2/3 h-full">
          {mainDisplayedParticipant && (
            <VideoParticipant
              name={`${visit.ehrPatient.given_name} ${visit.ehrPatient.family_name}`}
              hasAudio
              hasVideo
              participant={mainDisplayedParticipant}
              fullScreen
              setDataTrackMessage={setDataTrackMessage}
            />
          )}
        </div>
        <VideoControls
          containerClass="absolute bottom-10 mb-5 bg-[#FFFFFF4A] rounded-lg z-[50]"
          isMuted={!isAudioEnabled}
          isVideoStopped={!isVideoEnabled}
          addParticipant={toggleInviteModal}
          toggleAudio={toggleAudioEnabled}
          toggleChat={() => setIsChatWindowOpen(!isChatWindowOpen)}
          toggleScreenShare={toggleScreenShare}
          toggleSettings={(event) =>
            setSettingsModalRef(settingsModalRef ? null : event?.target)
          }
          toggleVideo={toggleVideoEnabled}
          toggleEndCallModal={toggleEndCallModal}
        />
        <div className="absolute bottom-6">
          <PoweredByTwilio inverted />
        </div>
      </div>
      {isChatWindowOpen && (
        <div className="absolute bottom-0 right-10 max-w-[405px] w-full max-h-[400px] h-full">
          <Chat
            close={() => setIsChatWindowOpen(false)}
            otherUser={visit.ehrPatient.name}
            users={chatUsers}
            userRole={user.role}
            userId={user.id}
            showHeader
            inputPlaceholder={callState.patientName ?? 'Send a message'}
          />
        </div>
      )}
      <ConnectionIssueModal
        close={() => setConnectionIssueModalVisible(false)}
        isVisible={connectionIssueModalVisible}
      />
      <InviteParticipantPopover
        referenceElement={inviteModalRef}
        close={() => setInviteModalRef(null)}
        isVisible={!!inviteModalRef}
      />
      <SettingsPopover
        referenceElement={settingsModalRef}
        close={() => setSettingsModalRef(null)}
        isRecording={isRecording}
        isVisible={!!settingsModalRef}
        toggleRecording={toggleRecordingCb}
      />
      <InviteParticipantModal
        close={toggleInviteModal}
        isVisible={inviteModalVisible}
        role="providervisitor"
      />
      <EndCallModal
        close={toggleEndCallModal}
        isVisible={endCallModalVisible}
        isProvider={true}
      />
    </div>
  );
};
