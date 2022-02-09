import { LocalAudioTrack, LocalTrackPublication, LocalVideoTrack } from 'twilio-video';
import { useCallback, useState } from 'react';
import useVideoContext from '../useVideoContext/useVideoContext';
import useIsTrackEnabled from "../useIsTrackEnabled/useIsTrackEnabled";

export default function useLocalVideoToggle() {
  const { room, localTracks, getLocalVideoTrack, removeLocalVideoTrack, onError } = useVideoContext();
  const localParticipant = room?.localParticipant;
  const videoTrack = localTracks.find(track => track.name.includes('camera')) as LocalVideoTrack;
  const [isPublishing, setIsPublishing] = useState(false);

  const toggleVideoEnabled = useCallback(() => {

    if (!isPublishing) {
      if (videoTrack) {
        if(videoTrack.isEnabled) {
          const localTrackPublication = localParticipant?.unpublishTrack(videoTrack);
          localParticipant?.emit('trackUnpublished', localTrackPublication);
          videoTrack.disable();
        } else {
            localParticipant?.publishTrack(videoTrack)
              .then((localTrackPublication: LocalTrackPublication) => {
                localParticipant?.emit('trackPublished', localTrackPublication);
                videoTrack.enable();
              });
        }
      } else {
        setIsPublishing(true);
        getLocalVideoTrack()
          .then((track: LocalVideoTrack) => localParticipant?.publishTrack(track, { priority: 'low' }))
          .catch(onError)
          .finally(() => {
            setIsPublishing(false);
          });
      }
    }
  }, [videoTrack, localParticipant, getLocalVideoTrack, isPublishing, onError, removeLocalVideoTrack]);

  return [!!videoTrack, toggleVideoEnabled] as const;
}
