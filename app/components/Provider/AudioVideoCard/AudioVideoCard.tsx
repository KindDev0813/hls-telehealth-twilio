/* eslint-disable @next/next/no-img-element */
import { AudioVideoSettings } from '../../AudioVideoSettings';
import { LocalVideoTrack } from 'twilio-video';
import useVideoContext from '../../Base/VideoProvider/useVideoContext/useVideoContext';
import { Card } from '../../Card';
import VideoTrack from '../../Base/ParticipantTracks/Publication/VideoTrack/VideoTrack';
import { useEffect, useState } from 'react';

export interface AudioVideoCardProps {}

export const AudioVideoCard = ({}: AudioVideoCardProps) => {
  const { localTracks } = useVideoContext();
  const [ videoTrack, setVideoTrack ] = useState<LocalVideoTrack>();

  useEffect(() => {
    setVideoTrack(localTracks.find(track => track.name.includes('camera')) as LocalVideoTrack); 
  }, [localTracks]);

  return (
    <>
      {videoTrack ?
        <div className='w-full mt-2.5'>
          <VideoTrack track={videoTrack} isLocal />
        </div> :
          <img src="/provider.jpg" alt="Provider" className="border border-light" /> 
      }
      <Card>
        <AudioVideoSettings />
      </Card>
    </>
  );
};
