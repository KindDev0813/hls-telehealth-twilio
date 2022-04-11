/* eslint-disable @next/next/no-img-element */
import { AudioVideoSettings } from '../../AudioVideoSettings';
import { LocalVideoTrack } from 'twilio-video';
import useVideoContext from '../../Base/VideoProvider/useVideoContext/useVideoContext';
import { Card } from '../../Card';
import VideoTrack from '../../Base/ParticipantTracks/Publication/VideoTrack/VideoTrack';
import { useEffect, useState } from 'react';
import { TelehealthVisit } from '../../../types';
import clientStorage from '../../../services/clientStorage';
import { FLEX_AGENT_NAME_KEY } from '../../../constants';

export interface AudioVideoCardProps {
  visitNext?: TelehealthVisit;
}

export const AudioVideoCard = ({ visitNext }: AudioVideoCardProps) => {
  const { localTracks } = useVideoContext();
  const [ flexAgentName, setFlexAgentName ] = useState<string>("");
  const [ videoTrack, setVideoTrack ] = useState<LocalVideoTrack>();

  useEffect(() => {
    const setAgentName = async () => {
        const agentName = await clientStorage.getFromStorage<string>(FLEX_AGENT_NAME_KEY);
        if (agentName) setFlexAgentName(agentName);
    }
    if (visitNext) setAgentName();
  }, [visitNext]);

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
      {flexAgentName ? 
        <div className="text-primary text-2xl mt-4 text-center">
          {flexAgentName}
        </div> :
        <></>
      }
      <Card>
        <AudioVideoSettings visitNext={visitNext} />
      </Card>
    </>
  );
};
