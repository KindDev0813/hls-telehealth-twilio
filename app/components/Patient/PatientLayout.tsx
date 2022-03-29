import router from "next/router";
import React, { useEffect, useState } from "react";
import { useVisitContext, VisitStateProvider } from "../../state/VisitContext";
import { ChatProvider } from "../Base/ChatProvider";
import { SyncProvider } from "../Base/SyncProvider";
import VideoProvider from "../Base/VideoProvider";
import useConnectionOptions from "../Base/VideoProvider/useConnectionOptions/useConnectionOptions";
import useVideoContext from "../Base/VideoProvider/useVideoContext/useVideoContext";
import composeProviders from "../ComposeProviders/ComposeProviders";
import {TwilioError} from "twilio-video";

const Providers = composeProviders(
  VideoProviderChildrenWrapper,
  ChatProvider,
  SyncProvider
)

function VideoProviderChildrenWrapper(props: React.PropsWithChildren<{}>) {
  const { visit, user } = useVisitContext();
  const { getAudioAndVideoTracks, localTracks, room } = useVideoContext();
  const [mediaError, setMediaError] = useState<Error>();

  useEffect(() => {
    if (!mediaError ) {
      if(!room) {
        getAudioAndVideoTracks().catch(error => {
          console.log('Error acquiring local media:');
          console.dir(error);
          setMediaError(error);
          void router.push("/patient/video/no-av-permission");
        });
      }
    }
  }, [getAudioAndVideoTracks, mediaError]);
  return (
    visit && user && (localTracks && localTracks.length > 1) &&
    <>
      { props.children }
    </>
  );
}

export function PatientVideoContextLayout(props: React.PropsWithChildren<{}>) {
  const connectionOptions = useConnectionOptions();

  const catchErrorAndRedirect = (error: TwilioError | Error) => {
    console.log('catchErrorAndRedirect', error);
    void router.push('/patient/visit-survey/');
  }

  return (
    <VisitStateProvider>
      <VideoProvider options={connectionOptions} onError={catchErrorAndRedirect}>
        <Providers>
          {props.children}
        </Providers>
      </VideoProvider>
    </VisitStateProvider>
  );
}
  
export default PatientVideoContextLayout;
