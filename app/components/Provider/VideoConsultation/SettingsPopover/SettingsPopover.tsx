import React, { useState } from 'react';
import { AudioVideoSettings } from '../../../AudioVideoSettings';
import { Popover, PopoverProps } from '../Popover';

export interface SettingsPopoverProps extends Omit<PopoverProps, 'children'> {
  close: () => void;
  isRecording: boolean;
  toggleRecording: () => void;
}

export const SettingsPopover = ({
  close,
  isRecording,
  toggleRecording,
  ...popoverProps
}: SettingsPopoverProps) => {
  return (
    <Popover {...popoverProps} close={close}>
      <div className="border-b border-border-primary">
        <h3 className="my-3 px-3">Settings</h3>
      </div>
      <AudioVideoSettings
        className="text-white px-8"
        isDark
        isCallInProgress
        isRecording={isRecording}
        toggleRecording={toggleRecording}
      />
    </Popover>
  );
};
