import React, { useEffect, useState } from "react";

function WaitTimer(props) {

  const appointmentTime = props.startTime;
  var textLabel: string = '';

  const calculateTime = () => {

    const currentTime = new Date().getTime();
    var estimatedTime: number;

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

  useEffect(() => {
    setTimeout(() => {
      setTimeLeft(calculateTime());
    }, 1000);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    // adding 00 to null values
    if (!timeLeft[interval]) {
      timerComponents.push(
          <span>{"00"}</span>
      );
    }
    // adding 0 to less than 10 values
     else if(timeLeft[interval] < 10){
      timerComponents.push(
          <span>{'0'}{timeLeft[interval]}</span>
      );
    }
     // adding other values
    else {
      timerComponents.push(
          <span>{timeLeft[interval]}</span>
      );
    }
    // adding colon
      timerComponents.push(
          <span>{":"}</span>
      );
  });

  // removing the last colon after seconds
  timerComponents.pop();

  return (
      <div className="font-bold text-light text-xs">
        <div>
          {textLabel} {timerComponents}
        </div>
      </div>
  );
}

export default WaitTimer;