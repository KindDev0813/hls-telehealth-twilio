import {useCallback, useEffect, useState} from "react";
import {DEFAULT_VIDEO_CONSTRAINTS} from "../../../../constants";
import {LocalAudioTrack, LocalDataTrack, LocalVideoTrack} from "twilio-video";
import useVideoContext from "../useVideoContext/useVideoContext";
import useMediaStreamTrack
    from "../../ParticipantTracks/Publication/VideoTrack/useMediaStreamTrack/useMediaStreamTrack";
import useDevices from "../useDevices/useDevices";

export function useToggleFacingMode() {

    const { localTracks }: { localTracks: (LocalAudioTrack | LocalVideoTrack | LocalDataTrack)[]} = useVideoContext();
    const videoTrack = localTracks.find(track => track.kind === 'video' ) as LocalVideoTrack;
    const mediaStreamTrack = useMediaStreamTrack(videoTrack);
    const { videoInputDevices } = useDevices();
    const [supportsFacingMode, setSupportsFacingMode] = useState(false);
    const flipCameraEnabled = (supportsFacingMode && videoInputDevices.length > 1);
    const flipCamera = useCallback(() => {
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

    return [flipCamera, flipCameraEnabled] as const;
}
