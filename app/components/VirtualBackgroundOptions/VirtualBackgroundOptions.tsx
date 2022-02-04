import React, { useEffect, useRef, useState } from 'react';
import { LocalVideoTrack } from 'twilio-video';
import { BackgroundSettings } from '../../types';
import { joinClasses } from '../../utils';
import useBackgroundSettings, { backgroundConfig } from '../Base/VideoProvider/useBackgroundSettings/useBackgroundSettings';
import useVideoContext from '../Base/VideoProvider/useVideoContext/useVideoContext';
import { Icon } from '../Icon';

export interface VirtualBackgroundOptionsProps {
  isDark?: boolean;
}

export const VirtualBackgroundOptions = ({
  isDark,
}: VirtualBackgroundOptionsProps) => {
  const fileInputRef = useRef(null);
  const { room, localTracks } = useVideoContext();
  const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack>();

  const [backgroundSettings, setBackgroundSettings] = useBackgroundSettings(localVideoTrack, room);

  useEffect(() => {
    setLocalVideoTrack(localTracks.find(track => track.name.includes('camera')) as LocalVideoTrack | undefined);
  },[localTracks]);

  const Option = ({ className = null, name = null, type = null, index = null, ...props }) => (
    <div
      className={joinClasses(
        'flex items-center justify-center border rounded h-[70px] cursor-pointer',
        className,
        backgroundSettings.name === name
          ? 'border-link'
          : isDark
          ? 'border-light'
          : 'border-black'
      )}
      onClick={() => setBackgroundSettings({ type, index, name } as BackgroundSettings)}
      {...props}
    ></div>
  );

  return (
    <div className="grid grid-cols-3 gap-1">
      <Option name="none" type="none" key={-1}>None</Option>
      <Option name="blur" type="blur" key={-2}>Blur</Option>
      {
        backgroundConfig.backgroundThumbs.map((thumb, idx) => {
          return <Option
            name={backgroundConfig.backgroundNames[idx]}
            type="image"
            className="bg-cover bg-center"
            style={{
              backgroundImage: `url(${thumb.src})`,
            }}
            key={idx}
            index={idx}
          />
        })
      }
      <Option name="upload">
        <a
          className="flex items-center text-link text-xs"
          onClick={() => fileInputRef?.current.click()}
        >
          <Icon name="add" /> <span className="underline">Upload</span>
        </a>
        <input ref={fileInputRef} type="file" className="hidden" />
      </Option>
    </div>
  );
};
