import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import {EHRAppointment} from "../../types";

export interface WaitTimerProps {
  appointmentData: EHRAppointment;
}

function WaitTimer(props: WaitTimerProps) {

  const appointmentTime = props.appointmentData.start_datetime_ltz.getTime();
  let textLabel: string = '';

  const calculateTime = () => {

    const currentTime = new Date().getTime();
    let estimatedTime: number;

    if (appointmentTime > currentTime) {
      // future schedule appointment case
      estimatedTime = appointmentTime - currentTime;
      textLabel = 'Starting: ';
    } else {
      // past scheduled appointment case
      estimatedTime = currentTime + (currentTime - (currentTime + appointmentTime));
      textLabel = 'Waiting: ';
    }

    let timeLeft = {};

    timeLeft = {
      dd: Math.floor(estimatedTime / (1000 * 60 * 60 * 24)),
      hh: Math.floor((estimatedTime / (1000 * 60 * 60)) % 24),
      mm: Math.floor((estimatedTime / 1000 / 60) % 60),
      ss: Math.floor((estimatedTime / 1000) % 60),
    };
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTime());

  useEffect(
      () => {
        let timer = setTimeout(() => setTimeLeft(calculateTime()), 1000);
        return () => {
          clearTimeout(timer);
        };
      },
  );

  return (
      <div className="font-bold text-light text-xs">
        <div>
          {textLabel}
          {Object.keys(timeLeft).map((interval) => {
              if (!timeLeft[interval]) {
                if (interval != 'ss'){
                  return <span key={uuidv4()}>{"00"}{":"}</span>
                } else {
                  return <span key={uuidv4()}>{"00"}</span>
                }
              }
              else if(timeLeft[interval] < 10) {
                if (interval != 'ss'){
                  return <span key={uuidv4()}>{'0'}{timeLeft[interval]}{":"}</span>
                } else {
                  return <span key={uuidv4()}>{'0'}{timeLeft[interval]}</span>
                }
              }
              else if(timeLeft[interval] >= 10) {
                if (interval != 'ss'){
                  return <span key={uuidv4()}>{timeLeft[interval]}{":"}</span>
                } else {
                  return <span key={uuidv4()}>{timeLeft[interval]}</span>
                }
              }
             })}
        </div>
      </div>
  );
}

export default WaitTimer;
