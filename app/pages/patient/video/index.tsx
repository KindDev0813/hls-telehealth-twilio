import React, { useEffect } from 'react';
import useVideoContext from '../../../components/Base/VideoProvider/useVideoContext/useVideoContext';
import { VideoConsultation } from '../../../components/Patient';
import { useVisitContext } from '../../../state/VisitContext';
import { PatientUser } from '../../../types';
import { roomService } from '../../../services/roomService';
import { useRouter } from 'next/router';
import PatientVideoContextLayout from '../../../components/Patient/PatientLayout';
import useChatContext from '../../../components/Base/ChatProvider/useChatContext/useChatContext';

const VideoPage = () => {
  const { user, visit } = useVisitContext();
  const { connect: videoConnect, room } = useVideoContext();
  const { connect: chatConnect } = useChatContext();
  const router = useRouter();

  useEffect(() => {
    if(!room) {
      roomService.checkRoom(user as PatientUser, visit.roomName)
      .then(roomTokenResp => {
        console.log("PATIENT RESP", roomTokenResp);
        if(!roomTokenResp.roomAvailable) {
          router.push('/patient/waiting-room');
        }
        const token = roomTokenResp.token;
        chatConnect(token);
        videoConnect(token);
      });
    }
  },[router, room]);

  return <VideoConsultation />;
};

VideoPage.Layout = PatientVideoContextLayout;
export default VideoPage;
