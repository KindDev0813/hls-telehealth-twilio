import { useEffect, useState } from 'react';
import { DataTrack as IDataTrack } from 'twilio-video';
import { DataTrackMessage } from '../../../types';

export default function useDataTrackMessage( track: IDataTrack | undefined) {
  const [dataTrackMessage, setDataTrackMessage] = useState<DataTrackMessage>(null);

  useEffect(() => {
    if (track) {
      const handleMessage = (message: string) => {
        const msg: DataTrackMessage = JSON.parse(message);

        setDataTrackMessage(msg);

        console.log("message", message);
      };
      track.on('message', handleMessage);
      return () => {
        track.off('message', handleMessage);
      };
    }
  }, [track]);

  return dataTrackMessage; // This component does not return any HTML, so we will return 'null' instead.
}