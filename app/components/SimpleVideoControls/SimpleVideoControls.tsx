import { Button, ButtonVariant } from '../Button';
import React, { useCallback, useEffect, useState } from 'react';
import { LocalAudioTrack, LocalDataTrack, LocalVideoTrack } from 'twilio-video';
import useVideoContext from '../Base/VideoProvider/useVideoContext/useVideoContext';
import useMediaStreamTrack
  from '../Base/ParticipantTracks/Publication/VideoTrack/useMediaStreamTrack/useMediaStreamTrack';
import { DEFAULT_VIDEO_CONSTRAINTS } from '../../constants';
import useDevices from '../Base/VideoProvider/useDevices/useDevices';

export const SimpleVideoControls = ({ containerClass }: { containerClass: string }) => {

  const { localTracks }: { localTracks: (LocalAudioTrack | LocalVideoTrack | LocalDataTrack)[]} = useVideoContext();
  const audioTrack = localTracks.find(track => track.kind ==='audio' ) as LocalAudioTrack;
  const videoTrack = localTracks.find(track => track.kind === 'video' ) as LocalVideoTrack;
  const mediaStreamTrack = useMediaStreamTrack(videoTrack);

  const [isMuted, setMute] = useState(false);
  const [isVideoStopped, setVideoState] = useState(false);
  const [supportsFacingMode, setSupportsFacingMode] = useState(false);
  const { videoInputDevices } = useDevices();


  const toggleFacingMode = useCallback(() => {
    const newFacingMode = mediaStreamTrack?.getSettings().facingMode === 'user' ? 'environment' : 'user';
    videoTrack?.restart({
      ...(DEFAULT_VIDEO_CONSTRAINTS as {}),
      facingMode: newFacingMode,
    });
  }, [mediaStreamTrack, videoTrack]);

  useEffect(() => {
    // The 'supportsFacingMode' variable determines if this component is rendered
    // If 'facingMode' exists, we will set supportsFacingMode to true.
    // However, if facingMode is ever undefined again (when the user unpublishes video), we
    // won't set 'supportsFacingMode' to false. This prevents the icon from briefly
    // disappearing when the user switches their front/rear camera.
    const currentFacingMode = mediaStreamTrack?.getSettings().facingMode;
    if (currentFacingMode && supportsFacingMode === false) {
      setSupportsFacingMode(true);
    }
  }, [mediaStreamTrack, supportsFacingMode]);

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
      {(supportsFacingMode && videoInputDevices.length > 1) && <Button
        className="my-2"
        icon="flip_camera_ios"
        iconType="outline"
        variant={ButtonVariant.tertiary}
        onClick={toggleFacingMode}
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
