import { joinClasses } from '../../utils';
import { LocalAudioTrack } from 'twilio-video';
import { useEffect, useState, useRef } from 'react';
import { interval } from 'd3-timer';
import ProgressBar from "@ramonak/react-progress-bar";
import useVideoContext from '../Base/VideoProvider/useVideoContext/useVideoContext';
import useIsTrackEnabled from '../Base/VideoProvider/useIsTrackEnabled/useIsTrackEnabled';
import useMediaStreamTrack from '../Base/ParticipantTracks/Publication/VideoTrack/useMediaStreamTrack/useMediaStreamTrack';

interface MicTestProps {
  className: string;
  isMicOn: boolean;
}

export function initializeAnalyser(stream: MediaStream) {
  const audioContext = new AudioContext();
  const audioSource = audioContext.createMediaStreamSource(stream);

  const analyser = audioContext.createAnalyser();
  analyser.smoothingTimeConstant = 0.2;
  analyser.fftSize = 256;

  audioSource.connect(analyser);
  return analyser;
}

function MicTest({className, isMicOn}: MicTestProps) {
  const { localTracks } = useVideoContext();
  const currentAudioTrack = localTracks.find(track => track.kind  === 'audio') as LocalAudioTrack;
  const isTrackEnabled = useIsTrackEnabled(currentAudioTrack as LocalAudioTrack);
  const mediaStreamTrack = useMediaStreamTrack(currentAudioTrack);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [analyser, setAnalyser] = useState<AnalyserNode>();

  useEffect(() => {
    if (currentAudioTrack && mediaStreamTrack && isTrackEnabled && isMicOn) {
    
      let newMediaStream = new MediaStream([mediaStreamTrack.clone()]);
      const stopAllMediaStreamTracks = () => newMediaStream.getTracks().forEach(track => track.stop());
      currentAudioTrack.on('stopped', stopAllMediaStreamTracks);
      
      const reinitializeAnalyser = () => {
        stopAllMediaStreamTracks();
        newMediaStream = new MediaStream([mediaStreamTrack.clone()]);
        setAnalyser(initializeAnalyser(newMediaStream));
      };

      setAnalyser(initializeAnalyser(newMediaStream));
      window.addEventListener('focus', reinitializeAnalyser);
      
      return () => {
        stopAllMediaStreamTracks();
        newMediaStream = new MediaStream([mediaStreamTrack.clone()]);
        setAnalyser(initializeAnalyser(newMediaStream));
      }
    }
  }, [currentAudioTrack, mediaStreamTrack, isTrackEnabled, isMicOn]);

  useEffect(() => {
    if (isTrackEnabled && progressBarRef && analyser && isMicOn) {
      const sampleArray = new Uint8Array(analyser.frequencyBinCount);

      const timer = interval(() => {
        analyser.getByteFrequencyData(sampleArray);
        let values = 0;

        const length = sampleArray.length;
        for (let i = 0; i < length; i++) {
          values += sampleArray[i];
        }

        const volume = Math.min(12, Math.max(0, Math.log10(values / length / 3) * 7));
        setAudioLevel(Math.floor(volume * 100 / 12));

      }, 100);
      return () => {
        setAudioLevel(0);
        timer.stop();
      };
    
    }
  }, [isTrackEnabled, analyser, isMicOn]);

  return (
    <div className={joinClasses(className, " space-x-2")}>
      <ProgressBar
        bgColor="#34D399"
        labelColor='#4B5563'
        height="20px"
        labelAlignment='left'
        borderRadius={"4px"}
        maxCompleted={100} 
        completed={`${audioLevel}`} 
        transitionDuration='0.2s' 
        customLabel=' '
      />
    </div>
  )
}

export default MicTest;
