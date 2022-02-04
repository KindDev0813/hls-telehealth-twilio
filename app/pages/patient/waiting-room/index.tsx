import React, { useEffect, useState } from 'react';
import { Button, ButtonVariant } from '../../../components/Button';
import { DateTime } from '../../../components/DateTime';
import { Heading } from '../../../components/Heading';
import { Layout } from '../../../components/Patient';
import { Modal } from '../../../components/Modal';
import { TechnicalCheck } from '../../../components/TechnicalCheck';
import { PatientUser, TwilioPage, EHRContent } from '../../../types';
import { useVisitContext } from '../../../state/VisitContext';
import useVideoContext from '../../../components/Base/VideoProvider/useVideoContext/useVideoContext';
import { roomService } from '../../../services/roomService';
import { useRouter } from 'next/router';
import PatientVideoContextLayout from '../../../components/Patient/PatientLayout';
import ReactPlayer from 'react-player';
import datastoreService from '../../../services/datastoreService';

/**
 * Waiting Room for patient
 * TODO:
 * - Get youtube video from content/visit 
 * - validate Youtube videos to ensure they exist before displaying.
 */
const WaitingRoomPage: TwilioPage = () => {
  const [ showLeaveConfirmation, setShowLeaveConfirmation ] = useState(false);
  const { visit, user } = useVisitContext();
  const { getAudioAndVideoTracks } = useVideoContext();
  const [ mediaError, setMediaError ] = useState<Error>();
  const [ waitingRoomContent, setWaitingRoomContent ] = useState<EHRContent>();
  const router = useRouter();

  function leaveWaitingRoom() {
    router.push('/patient/waiting-room/left');
  }

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
    if (user && visit) {
      datastoreService.fetchContentForPatient(user, visit.ehrProvider.id)
          .then((c) => {
            setWaitingRoomContent(c);
          });
    }
  }, [user, visit]);

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
      { visit && waitingRoomContent ? (
        <>
          <Heading>Your Appointment</Heading>
          <div className='mb-2 text-secondary flex flex-col items-center'>
            <p>{visit.ehrProvider.name}</p>
            <DateTime date={visit.ehrAppointment.start_datetime_ltz.toString()} />
          </div>
          <div className='my-4 px-10 md:px-2 lg:px-2 xl:px-2 flex flex-col items-center justify-center'>
            <TechnicalCheck videoImage='/patient.jpg' />
            <div className='text-tertiary'>
              Your visit will start when the provider joins
            </div>
            {/* <div className='flex items-center justify-center bg-secondary text-white text-2xl h-[150px] w-full m-2'>
              Content Area
            </div> */}
            <ReactPlayer 
              url={waitingRoomContent.video_url}
              width={320}
              height={180}
              controls={true}
              />
            <Button
              className='mt-2 px-8'
              variant={ButtonVariant.secondary}
              outline
              onClick={() => setShowLeaveConfirmation(true)}
            >
              Leave Waiting Room
            </Button>
          </div>
        </>) : (<></>)
      }
      <Modal isVisible={showLeaveConfirmation}>
        <div className="flex flex-col text-center p-4">
          <p className="mb-4 text-primary">
            Are you sure you want to leave the waiting room? Your visit will
            start shortly.
          </p>

          <Button
            className="mt-2 px-8"
            onClick={() => setShowLeaveConfirmation(false)}
          >
            Stay in Waiting Room
          </Button>
          <Button
            onClick={leaveWaitingRoom}
            className="mt-2 px-8"
            variant={ButtonVariant.secondary}
            outline
          >
            Leave Waiting Room
          </Button>
        </div>
      </Modal>
    </Layout>
  );
};

WaitingRoomPage.Layout = PatientVideoContextLayout;
export default WaitingRoomPage;
