import React, { useEffect, useState } from 'react';
import { DataTrack, LocalAudioTrack, LocalParticipant, RemoteAudioTrack, RemoteDataTrack, RemoteParticipant } from 'twilio-video';
import { joinClasses } from '../../../../utils';
import ParticipantTracks from '../../../Base/ParticipantTracks/ParticipantTracks';
import useTrack from '../../../Base/ParticipantTracks/Publication/useTrack/useTrack';
import usePublications from '../../../Base/ParticipantTracks/usePublications/usePublications';
import useIsTrackEnabled from '../../../Base/VideoProvider/useIsTrackEnabled/useIsTrackEnabled';
import { Icon } from '../../../Icon';
import useDataTrackMessage from '../../../Base/DataTracks/useDataTrack';
import useLocalAudioToggle from '../../../Base/VideoProvider/useLocalAudioToggle/useLocalAudioToggle';
import useScreenShareParticipant from '../../../Base/VideoProvider/useScreenShareParticipant/useScreenShareParticipant';
import useMainParticipant from '../../../Base/VideoProvider/useMainParticipany/useMainParticipant';
import useVideoContext from '../../../Base/VideoProvider/useVideoContext/useVideoContext';
import useSelectedParticipant from '../../../Base/VideoProvider/useSelectedParticipant/useSelectedParticipant';
export interface VideoParticipantProps {
  hasAudio?: boolean;
  hasVideo?: boolean;
  isProvider?: boolean;
  isOverlap?: boolean;
  isSelf?: boolean;
  name: string;
  participant: LocalParticipant | RemoteParticipant,
  carouselScreen?:boolean;
}

export const VideoParticipant = ({
  name,
  hasAudio,
  hasVideo,
  isProvider,
  isOverlap,
  isSelf,
  participant,
  carouselScreen
}: VideoParticipantProps) => {
  const [showMutedBanner, setShowMutedBanner] = useState(null);
  const [isPinned, setIsPinned] = useState(false);
  const [muted, setMuted] = useState(hasAudio);
  const [showVideo, setShowVideo] = useState(hasVideo);
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const screenShareParticipant = useScreenShareParticipant();
  const mainParticipant = useMainParticipant();
  const [selectedParticipant] = useSelectedParticipant();
  const { room } = useVideoContext();
  const localParticipant = room!.localParticipant;

  const publications = usePublications(participant);
  const videoPublication = publications.find(p => !p.trackName.includes('screen') && p.kind === 'video');
  const screenSharePublication = publications.find(p => p.trackName.includes('screen'));
  const audioPublication = publications.find(p => p.kind === 'audio');
  const dataPublication = publications.find(p => p.kind === 'data');

  const videoTrack = useTrack(videoPublication || screenSharePublication);
  const audioTrack = useTrack(audioPublication) as LocalAudioTrack | RemoteAudioTrack | undefined;
  const dataTrack = useTrack(dataPublication) as DataTrack | undefined;

  const isVideoEnabled = Boolean(videoTrack);
  const isTrackEnabled = useIsTrackEnabled(audioTrack as LocalAudioTrack | RemoteAudioTrack);
  const amIMuted = useDataTrackMessage(dataTrack);

  const videoPriority = (mainParticipant === selectedParticipant || mainParticipant === screenShareParticipant) &&
    mainParticipant !== localParticipant
    ? 'high'
    : null; 

   // TODO - move to tailwind config
  let widthClass = isOverlap
   ? 'w-[92px]'
   : isProvider
   ? 'w-[405px]'
   : 'w-[274px]';
  let heightClass = isOverlap
     ? 'h-[122px]'
     : isProvider
     ? 'h-[234px]'
     : 'h-[364px]';
  if (carouselScreen) {
    widthClass = 'w-[200px]';
    heightClass = 'h-[300px]';
  }

  useEffect(() => {
    // toggleAudioEnabled() only works for local user
    // in this case the patient
    toggleAudioEnabled();
  }, [amIMuted, toggleAudioEnabled]);

  // Muting non-self Participants useEffect
  // Will need to account for 3rd party later on
  useEffect(() => {
    if (isTrackEnabled) { 
      setMuted(false);
    } else {
      setMuted(true);
    }
  }, [isTrackEnabled]);

  // Video disabling effect
  useEffect(() => {
    if (!isVideoEnabled) { 
      setShowVideo(false);
    } else {
      setShowVideo(true);
    }
  }, [isVideoEnabled]);

  useEffect(() => {
    let timer;
    if(muted) {
      setShowMutedBanner(true);
      timer = setTimeout(() => {
        setShowMutedBanner(false);
        clearTimeout(timer);
      }, 3000);
    } else {
      setShowMutedBanner(false);
    }
    return () => clearTimeout(timer);

  }, [muted]);

  return (
    <div className="mx-auto relative w-max group">
      {!isSelf && (
        <div className="absolute inset-0 text-right w-full flex justify-end group-hover:bg-gradient-to-b from-gray-700 via-transparent to-transparent">
          <div
            className={joinClasses(
              'p-1',
              !isPinned && 'hidden group-hover:block'
            )}
          >
            <button
              className={joinClasses(
                'border-0 bg-transparent rotate-45 p-2',
                isPinned ? 'text-primary' : 'text-white'
              )}
              onClick={() => setIsPinned(!isPinned)}
            >
              <Icon name="push_pin" outline={!isPinned} />
            </button>
          </div>
        </div>
      )}
      {showMutedBanner && isSelf && (
        <div className="absolute top-0 bottom-0 left--2 right--2 flex items-center justify-center w-full rounded-lg z-30">
          <div className="bg-[#000000BF] text-white h-min text-center flex-grow py-4">
            You have been muted
          </div>
        </div>
      )}
      <div
        className={`flex items-center justify-center bg-dark text-white text-2xl overflow-hidden ${heightClass} ${widthClass}`}
      >
        {!showVideo && name}
        {showVideo && <ParticipantTracks
          participant={participant}
          videoOnly={false}
          enableScreenShare={mainParticipant !== localParticipant}
          videoPriority={videoPriority}
          isLocalParticipant={isSelf}
        />}
      </div>
      <div className="absolute bottom-0 right-0 text-white bg-[#00000082] px-2 py-1 flex items-center">
        <Icon
          className={joinClasses('text-md', muted && 'text-primary')}
          name="mic"
        />
        {showVideo ? name : (
          <Icon className="text-md text-primary" name="videocam_off" />
        )}
      </div>
    </div>
  );
};
