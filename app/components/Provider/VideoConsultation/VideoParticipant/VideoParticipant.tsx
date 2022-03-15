import { useEffect, useState } from 'react';
import { LocalAudioTrack, LocalParticipant, RemoteAudioTrack, RemoteParticipant } from 'twilio-video';
import { joinClasses } from '../../../../utils';
import ParticipantTracks from '../../../Base/ParticipantTracks/ParticipantTracks';
import useTrack from '../../../Base/ParticipantTracks/Publication/useTrack/useTrack';
import usePublications from '../../../Base/ParticipantTracks/usePublications/usePublications';
import useIsTrackEnabled from '../../../Base/VideoProvider/useIsTrackEnabled/useIsTrackEnabled';
import { Icon } from '../../../Icon';
import { Popover } from '../Popover';
import useVideoContext from '../../../Base/VideoProvider/useVideoContext/useVideoContext';
import useMainParticipant from '../../../Base/VideoProvider/useMainParticipany/useMainParticipant';
import useSelectedParticipant from '../../../Base/VideoProvider/useSelectedParticipant/useSelectedParticipant';
import useScreenShareParticipant from '../../../Base/VideoProvider/useScreenShareParticipant/useScreenShareParticipant';
export interface VideoParticipantProps {
  hasAudio?: boolean;
  hasVideo?: boolean;
  isProvider?: boolean;
  isSelf?: boolean;
  name: string;
  participant: LocalParticipant | RemoteParticipant;
  fullScreen?:boolean;
}

export const VideoParticipant = ({
  name,
  hasAudio,
  hasVideo,
  isProvider,
  isSelf,
  participant,
  fullScreen
}: VideoParticipantProps) => {
  const [showMutedBanner, setShowMutedBanner] = useState(null);
  const [showMenuRef, setShowMenuRef] = useState(null);
  const [isPinned, setIsPinned] = useState(false);
  const [muted, setMuted] = useState(hasAudio);
  const [showVideo, setShowVideo] = useState(hasVideo);
  const { room } = useVideoContext();
  const mainParticipant = useMainParticipant();
  const localParticipant = room!.localParticipant;
  const [selectedParticipant, setSelectedParticipant] = useSelectedParticipant();
  const screenShareParticipant = useScreenShareParticipant();

  const publications = usePublications(participant);
  const videoPublication = publications.find(p => !p.trackName.includes('screen') && p.kind === 'video');
  const screenSharePublication = publications.find(p => p.trackName.includes('screen'));
  const audioPublication = publications.find(p => p.kind === 'audio');

  const audioTrack = useTrack(audioPublication) as LocalAudioTrack | RemoteAudioTrack | undefined;
  const videoTrack = useTrack(videoPublication || screenSharePublication);
  
  const isVideoEnabled = Boolean(videoTrack);
  const isTrackEnabled = useIsTrackEnabled(audioTrack as LocalAudioTrack | RemoteAudioTrack);

  const videoPriority = (mainParticipant === selectedParticipant || mainParticipant === screenShareParticipant) &&
    mainParticipant !== localParticipant
    ? 'high'
    : null; 

  // TODO - move to tailwind config
  let widthClass = isProvider ? 'w-[405px]' : 'w-[685px]';
  let heightClass = isProvider ? 'h-[234px]' : 'max-h-100%';
  if (fullScreen) {
    widthClass = 'w-full';
    heightClass = 'h-full';
  }

  // this function only visible for Patient Video
  const handleMuteParticipant = () => {
    if (room) {
      setMuted(prev => !prev);
      // @ts-ignore
      const [localDataTrackPublication] = [...room.localParticipant.dataTracks.values()];
      localDataTrackPublication.track.send(muted);
    }
  }

  // Muting non-self Participants useEffect
  // Will need to account for 3rd party later on
  useEffect(() => {
    if (isTrackEnabled) {
      setMuted(false);
    } else {
      setMuted(true);
    }
  }, [audioTrack, isTrackEnabled]);

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

  const currentParticipant = isSelf ? mainParticipant : participant;

  return (
    <div className={joinClasses(
      'mx-auto relative group',
      fullScreen ? 'h-full w-full' : 'w-max'
    )}>
      {!isSelf && (
        <div className="absolute top-0 h-[100px] text-right w-full flex justify-end group-hover:bg-gradient-to-b from-[#000000B0] via-[#00000000] to-[#00000000] z-10">
          <div>
            <button
              className={joinClasses(
                '-mt-1 rotate-45 p-2',
                isPinned ? 'text-primary' : 'hidden'
              )}
              onClick={() => setIsPinned(!isPinned)}
            >
              <Icon name="push_pin" outline={!isPinned} />
            </button>
          </div>
          <div className={joinClasses('hidden group-hover:block')}>
            <button
              className={joinClasses('-mt-1 border-0 bg-transparent px-1')}
              onClick={(event) => setShowMenuRef(event.target)}
            >
              <Icon className="text-white text-4xl" name="more_horiz" />
            </button>
            <Popover
              referenceElement={showMenuRef}
              isVisible={!!showMenuRef}
              close={() => setShowMenuRef(null)}
            >
              <ul>
                <li className="m-2">
                  <button
                    className="w-full text-left"
                    type="button"
                    onClick={() => {setIsPinned(!isPinned); setSelectedParticipant(currentParticipant)}}
                  >
                    {isPinned ? 'Unpin' : 'Pin'} Participant
                  </button>
                </li>
                <li className='border-t border-dark'/>
                <li className="m-2">
                  <button
                    className="w-full text-left"
                    type="button"
                    onClick={handleMuteParticipant}
                  >
                    {muted ? 'Unmute' : 'Mute'} participant
                  </button>
                </li>
                <li className="m-2">
                  <button
                    className="w-full text-left"
                    type="button"
                    onClick={() => setShowVideo(!showVideo)}
                  >
                    Turn {showVideo ? 'off' : 'on'} participant video
                  </button>
                </li>
              </ul>
            </Popover>
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
        className={`relative flex items-center justify-center bg-dark text-white text-2xl overflow-hidden ${heightClass} ${widthClass}`}
      >
        {!showVideo && (
          <div className="absolute inset-0 bg-dark text-white flex items-center justify-center text-sm">
            {name}
          </div>
        )}
        <ParticipantTracks
          participant={isSelf ? mainParticipant : participant}
          videoOnly={false}
          enableScreenShare={true}
          videoPriority={videoPriority}
          isLocalParticipant={mainParticipant === localParticipant}
        />
      </div>
      <div className="absolute top-0 left-0 w-max z-50 text-white bg-[#00000082] px-2 py-1 flex items-center">
        <Icon
          className={joinClasses('text-md', muted && 'text-primary')}
          name="mic"
        />
        {showVideo ? (
          !isSelf && name
        ) : (
          <Icon className="text-md text-primary" name="videocam_off" />
        )}
      </div>
    </div>
  );
};
