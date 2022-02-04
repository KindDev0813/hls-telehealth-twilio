import React, { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { Heading } from '../../components/Heading';
import { Layout } from '../../components/Patient';
import { TechnicalCheck } from '../../components/TechnicalCheck';
import { PatientUser, TwilioPage } from '../../types';
import PatientVideoContextLayout from '../../components/Patient/PatientLayout';
import { roomService } from '../../services/roomService';
import { useRouter } from 'next/router';
import useVideoContext from '../../components/Base/VideoProvider/useVideoContext/useVideoContext';
import { useVisitContext } from '../../state/VisitContext';

const data = {
  date: new Date(),
  doctorName: 'Dr. Josefina Santos',
};

const TechnicalCheckPage: TwilioPage = () => {
  const { visit, user } = useVisitContext();
  const { getAudioAndVideoTracks } = useVideoContext();
  const [mediaError, setMediaError] = useState<Error>();
  const router = useRouter();

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
      const interval = setInterval(() => roomService.checkRoom(user as PatientUser, visit.roomName)
      .then(room => {
        if(room.roomAvailable) {
          router.push("/patient/video/")
        }
      }), 5000);
      return () => clearInterval(interval);
    }
  }, [router, visit, user]);
  return (
    <Layout>
      <div className="my-4 flex flex-col items-center justify-center">
        <Heading>Invited to Appointment</Heading>
        <div className="mb-2 text-secondary">{data.doctorName}</div>
        <TechnicalCheck videoImage="/invited-attendee.svg" />
        <Button className="my-2 px-8">Continue to Visit</Button>
        <div className="flex items-center justify-center bg-secondary text-white text-2xl h-[200px] w-full m-2">
          Content Area
        </div>
      </div>
    </Layout>
  );
};

TechnicalCheckPage.Layout = PatientVideoContextLayout;
export default TechnicalCheckPage;
