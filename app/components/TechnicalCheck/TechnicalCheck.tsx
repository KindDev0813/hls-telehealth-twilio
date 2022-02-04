/* eslint-disable @next/next/no-img-element */
import React from 'react';
import {LocalAudioTrack, LocalDataTrack, LocalVideoTrack } from 'twilio-video';
import VideoTrack from '../Base/ParticipantTracks/Publication/VideoTrack/VideoTrack';
import useVideoContext from '../Base/VideoProvider/useVideoContext/useVideoContext';
import AudioTrack from '../Base/ParticipantTracks/Publication/AudioTrack/AudioTrack';
import { SimpleVideoControls } from '../SimpleVideoControls';

export interface TechnicalCheckProps {
  // Can be removed in actual implementation
  videoImage: string;
}

export const TechnicalCheck = ({ videoImage }: TechnicalCheckProps) => {

  const { localTracks }: { localTracks: (LocalAudioTrack | LocalVideoTrack | LocalDataTrack)[]} = useVideoContext();
  const audioTrack = localTracks.find(track => track.kind ==='audio' ) as LocalAudioTrack;
  const videoTrack = localTracks.find(track => track.kind === 'video' ) as LocalVideoTrack;

  const styles = {
    width: '187px',
    height: '250px'
  }
  return (
    <div className="flex mt-4 mb-1">
      <SimpleVideoControls containerClass='flex flex-col justify-center px-1'/>
      <div className="flex-grow px-1" style={styles}>
      {videoTrack ? (
          <VideoTrack track={videoTrack} isLocal/>
        ) : (
            <img src={videoImage} alt="Video"/>
        )}
      </div>
      {audioTrack && <AudioTrack track={audioTrack} />}
    </div>
  );
};
