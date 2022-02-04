import { useEffect, useState } from 'react';
import { Room } from 'twilio-video';

export default function useLocalParticipantNetworkQualityLevel(room: Room) {
  const [networkQualityLevel, setNetworkQualityLevel] = useState(null);

  useEffect(() => {
    if(room) {
      const handleNewtorkQualityLevelChange = (newNetworkQualityLevel: number) =>
        setNetworkQualityLevel(newNetworkQualityLevel);

      setNetworkQualityLevel(room.localParticipant.networkQualityLevel);
      room.localParticipant.on('networkQualityLevelChanged', handleNewtorkQualityLevelChange);
      return () => {
        room.localParticipant.off('networkQualityLevelChanged', handleNewtorkQualityLevelChange);
      };
    }
  }, [room]);

  return networkQualityLevel;
}