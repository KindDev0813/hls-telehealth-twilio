import React, { useEffect, useState } from "react";
import VideoProvider from "../Base/VideoProvider";
import useConnectionOptions from "../Base/VideoProvider/useConnectionOptions/useConnectionOptions";
import { useVisitContext, VisitStateProvider } from "../../state/VisitContext";
import useVideoContext from "../Base/VideoProvider/useVideoContext/useVideoContext";
import { ChatProvider } from "../Base/ChatProvider";
import composeProviders from "../ComposeProviders/ComposeProviders";
import { SyncProvider } from "../Base/SyncProvider";

const Providers = composeProviders(
  VideoProviderChildrenWrapper,
  ChatProvider,
  SyncProvider
)

function VideoProviderChildrenWrapper(props: React.PropsWithChildren<{}>) {
  const { user } = useVisitContext();
  const { getAudioAndVideoTracks, localTracks, room } = useVideoContext();
  const [mediaError, setMediaError] = useState<Error>();

  useEffect(() => {
    if (!mediaError) {
      if(!room) {
        getAudioAndVideoTracks().catch(error => {
          console.log('Error acquiring local media:');
          console.dir(error);
          setMediaError(error);
        });
      }
    }
  }, [getAudioAndVideoTracks, mediaError]);
  return (
    user && (localTracks && localTracks.length > 1) &&
    <>
      { props.children }
    </>
  );
}

export function ProviderVideoContextLayout(props: React.PropsWithChildren<{}>) {
  const connectionOptions = useConnectionOptions();
  return (
    <VisitStateProvider>
      <VideoProvider options={connectionOptions} onError={(error) => console.log(error)}>
        <Providers>
          {props.children}
        </Providers>
      </VideoProvider>
    </VisitStateProvider>
  );
}

export default ProviderVideoContextLayout;
  