import React, { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { Heading } from '../../components/Heading';
import { Layout } from '../../components/Patient';
import { TechnicalCheck } from '../../components/TechnicalCheck';
import { PatientUser, TwilioPage, TelehealthVisit } from '../../types';
import PatientVideoContextLayout from '../../components/Patient/PatientLayout';
import { roomService } from '../../services/roomService';
import { useRouter } from 'next/router';
import useVideoContext from '../../components/Base/VideoProvider/useVideoContext/useVideoContext';
import { useVisitContext } from '../../state/VisitContext';


const TechnicalCheckPage: TwilioPage = () => {
  const { visit, user } = useVisitContext();
  const { getAudioAndVideoTracks } = useVideoContext();
  const [mediaError, setMediaError] = useState<Error>();
  const router = useRouter();
  const [roomAvailable, setRoomAvailable] = useState<boolean>(false);

  useEffect(() => {
    if (!mediaError) {
      getAudioAndVideoTracks().catch(error => {
        console.log('Error acquiring local media:');
        console.dir(error);
        setMediaError(error);
      });
    }
  }, [getAudioAndVideoTracks, mediaError]);

  useEffect(() => {
      if(user && visit) {
        checkRoom(user as PatientUser, visit);
      }
  }, [router, visit, user]);

  function checkRoom(user: PatientUser, visit: TelehealthVisit) {
    roomService.checkRoom(user as PatientUser, visit.roomName)
      .then(room => {
        if(room.roomAvailable) {
          setRoomAvailable(true);
        } else {
          checkRoom(user, visit);
        }
      });
  }

  function continueToVisit() {
    if(roomAvailable) {
      router.push("/patient/video/")
    }
  }  

  return (
    <Layout>
      <div className="my-4 flex flex-col items-center justify-center">
        <Heading>Invited to Appointment</Heading>
        <div className="mb-2 text-secondary">{visit.ehrProvider.name}</div>
        <TechnicalCheck videoImage="/invited-attendee.svg" />
        <Button className="my-2 px-8" disabled={!roomAvailable} onClick={continueToVisit} >Continue to Visit</Button>
      </div>
    </Layout>
  );
};

TechnicalCheckPage.Layout = PatientVideoContextLayout;
export default TechnicalCheckPage;
