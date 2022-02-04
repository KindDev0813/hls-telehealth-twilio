import { LocalVideoTrack, Room } from 'twilio-video';
import { useState, useEffect, useCallback } from 'react';
import { SELECTED_BACKGROUND_SETTINGS_KEY } from '../../../../constants';
import {
  GaussianBlurBackgroundProcessor,
  VirtualBackgroundProcessor,
  ImageFit,
  isSupported,
} from '@twilio/video-processors';
import { backgroundNames, backgroundImages, backgroundThumbs } from '../../../../backgrounds';
import { BackgroundSettings } from '../../../../types';

let imageElements = new Map();

const getImage = (index: number): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    if (imageElements.has(index)) {
      return resolve(imageElements.get(index));
    }
    const img = new Image();
    img.onload = () => {
      imageElements.set(index, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = backgroundImages[index].src;
  });
};

export const backgroundConfig = {
  backgroundNames,
  backgroundThumbs,
};

const virtualBackgroundAssets = '/static/virtualbackground';
let blurProcessor: GaussianBlurBackgroundProcessor;
let virtualBackgroundProcessor: VirtualBackgroundProcessor;

export default function useBackgroundSettings(videoTrack: LocalVideoTrack | undefined, room?: Room | null) {
  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>(() => {
    const localStorageSettings = window.localStorage.getItem(SELECTED_BACKGROUND_SETTINGS_KEY);
    return localStorageSettings ? JSON.parse(localStorageSettings) : { type: 'none', index: 0 };
  });

  const removeProcessor = useCallback(() => {
    if (videoTrack && videoTrack.processor) {
      videoTrack.removeProcessor(videoTrack.processor);
    }
  }, [videoTrack]);

  const addProcessor = useCallback(
    (processor: GaussianBlurBackgroundProcessor | VirtualBackgroundProcessor) => {
      if (!videoTrack || videoTrack.processor === processor) {
        return;
      }
      removeProcessor();
      videoTrack.addProcessor(processor);
    },
    [videoTrack, removeProcessor]
  );

  useEffect(() => {
    if (!isSupported) {
      return;
    }
    // make sure localParticipant has joined room before applying video processors
    // this ensures that the video processors are not applied on the LocalVideoPreview
    const handleProcessorChange = async () => {
      if (!blurProcessor) {
        blurProcessor = new GaussianBlurBackgroundProcessor({
          assetsPath: virtualBackgroundAssets,
        });
        await blurProcessor.loadModel();
      }
      if (!virtualBackgroundProcessor) {
        virtualBackgroundProcessor = new VirtualBackgroundProcessor({
          assetsPath: virtualBackgroundAssets,
          backgroundImage: await getImage(0),
          fitType: ImageFit.Cover,
        });
        await virtualBackgroundProcessor.loadModel();
      }
      /*if (!room?.localParticipant) {
        return;
      }*/

      if (backgroundSettings.type === 'blur') {
        addProcessor(blurProcessor);
      } else if (backgroundSettings.type === 'image' && typeof backgroundSettings.index === 'number') {
        virtualBackgroundProcessor.backgroundImage = await getImage(backgroundSettings.index);
        addProcessor(virtualBackgroundProcessor);
      } else {
        removeProcessor();
      }
    };
    handleProcessorChange();
    window.localStorage.setItem(SELECTED_BACKGROUND_SETTINGS_KEY, JSON.stringify(backgroundSettings));
  }, [backgroundSettings, videoTrack, room, addProcessor, removeProcessor]);

  return [backgroundSettings, setBackgroundSettings] as const;
}
