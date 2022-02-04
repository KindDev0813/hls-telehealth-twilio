import useVideoContext from '../useVideoContext/useVideoContext';
import useScreenShareParticipant from '../useScreenShareParticipant/useScreenShareParticipant';

export default function useMainParticipant() {
  const screenShareParticipant = useScreenShareParticipant();
  const { room } = useVideoContext();
  const localParticipant = room?.localParticipant;
  const remoteScreenShareParticipant = screenShareParticipant !== localParticipant ? screenShareParticipant : null;

  // The participant that is returned is displayed in the main video area. Changing the order of the following
  // variables will change the how the main speaker is determined.
  return remoteScreenShareParticipant || localParticipant;
}
