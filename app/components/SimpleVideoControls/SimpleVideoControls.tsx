import { Button, ButtonVariant } from '../Button';
import React, { useEffect, useState } from 'react';
import { LocalAudioTrack, LocalDataTrack, LocalVideoTrack } from 'twilio-video';
import useVideoContext from '../Base/VideoProvider/useVideoContext/useVideoContext';
import {useToggleFacingMode} from "../Base/VideoProvider/useToggleFacingMode/useToggleFacingMode";

export const SimpleVideoControls = ({ containerClass }: { containerClass: string }) => {

  const { localTracks }: { localTracks: (LocalAudioTrack | LocalVideoTrack | LocalDataTrack)[]} = useVideoContext();
  const audioTrack = localTracks.find(track => track.kind ==='audio' ) as LocalAudioTrack;
  const videoTrack = localTracks.find(track => track.kind === 'video' ) as LocalVideoTrack;

  const [isMuted, setMute] = useState(false);
  const [isVideoStopped, setVideoState] = useState(false);
  const [flipCamera, flipCameraEnabled] = useToggleFacingMode();

  useEffect(() => {
    if (videoTrack) {
      if (isVideoStopped) {
        videoTrack.disable()
      } else {
        videoTrack.enable();
      }
    }
  }, [isVideoStopped]);

  useEffect(() => {
    if (audioTrack) {
      if (isMuted) {
        audioTrack.disable()
      } else {
        audioTrack.enable();
      }
    }
  }, [isMuted]);


  return (
    <div className={containerClass}>
      {flipCameraEnabled && <Button
        className="my-2"
        icon="flip_camera_ios"
        iconType="outline"
        variant={ButtonVariant.tertiary}
        onClick={flipCamera}
      />}
      <Button
        className="my-2"
        icon={isVideoStopped ? "videocam_off": "videocam"}
        iconType="outline"
        variant={ButtonVariant.tertiary}
        onClick={() => setVideoState(!isVideoStopped)}
      />
      <Button
        className="my-2"
        icon={isMuted ? "mic_off" : "mic"}
        iconType="outline"
        variant={ButtonVariant.tertiary}
        onClick={() => setMute(!isMuted)}
      />
    </div>
  )
}
