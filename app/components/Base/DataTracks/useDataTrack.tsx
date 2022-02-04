import { useEffect, useState } from 'react';
import { DataTrack as IDataTrack } from 'twilio-video';

export default function DataTrack( track: IDataTrack | undefined) {
  const [dataTrackMessage, setDataTrackMessage] = useState<boolean>(false);

  useEffect(() => {
    if (track) {
      const handleMessage = (message: boolean) => {
        
        setDataTrackMessage(message);
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