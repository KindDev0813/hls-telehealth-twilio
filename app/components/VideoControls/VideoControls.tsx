import { MouseEventHandler, useRef } from 'react';
import { joinClasses } from '../../utils';
import { Button, ButtonVariant } from '../Button';

type ControlClickEvent = MouseEventHandler<
  HTMLAnchorElement | HTMLButtonElement
>;

export interface VideoControlsProps {
  containerClass?: string;
  addParticipant?: ControlClickEvent;
  flipCamera?: ControlClickEvent;
  toggleAudio?: ControlClickEvent;
  toggleChat?: ControlClickEvent;
  toggleScreenShare?: ControlClickEvent;
  toggleSettings?: ControlClickEvent;
  toggleVideo?: ControlClickEvent;
  toggleEndCallModal?: ControlClickEvent;
  isMuted: boolean;
  isVideoStopped: boolean;
}

export const VideoControls = ({
  containerClass,
  addParticipant,
  flipCamera,
  toggleAudio,
  toggleChat,
  toggleScreenShare,
  toggleSettings,
  toggleVideo,
  toggleEndCallModal,
  isMuted,
  isVideoStopped
}: VideoControlsProps) => {
  const buttonClasses = 'mx-1.5';

  return (
    <div
      className={joinClasses(
        'mx-auto flex px-2 py-4 justify-between',
        containerClass
      )}
    >
      {addParticipant && (
        <Button
          className={buttonClasses}
          icon="person_add"
          variant={ButtonVariant.tertiary}
          onClick={addParticipant}
        />
      )}
      {toggleChat && (
        <Button
          className={buttonClasses}
          icon="chat_bubble_outline"
          variant={ButtonVariant.tertiary}
          onClick={toggleChat}
        />
      )}
      {toggleScreenShare && (
        <Button
          className={buttonClasses}
          icon="present_to_all"
          variant={ButtonVariant.tertiary}
          onClick={toggleScreenShare}
        />
      )}
      {toggleVideo && (
        <Button
          className={buttonClasses}
          icon={isVideoStopped ? "videocam_off": "videocam"}
          variant={ButtonVariant.tertiary}
          onClick={toggleVideo}
        />
      )}
      {toggleAudio && (
        <Button
          className={buttonClasses}
          icon={isMuted ? "mic_off" : "mic"}
          variant={ButtonVariant.tertiary}
          onClick={toggleAudio}
        />
      )}
      {flipCamera && (
        <Button
          className={buttonClasses}
          icon="flip_camera_ios"
          variant={ButtonVariant.tertiary}
          onClick={flipCamera}
        />
      )}
      {toggleSettings && (
        <Button
          className={buttonClasses}
          icon="settings"
          iconType="outline"
          variant={ButtonVariant.tertiary}
          onClick={toggleSettings}
        />
      )}
      {toggleEndCallModal && (
        <Button
          className={buttonClasses}
          // as="a"
          // href="/patient/video/disconnected"
          icon="call_end"
          onClick={toggleEndCallModal}
        />
      )}
    </div>
  );
};
