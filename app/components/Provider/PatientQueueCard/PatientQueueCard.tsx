import { Card } from '../../Card';
import { CardHeading } from '../CardHeading';
import {TelehealthVisit} from "../../../types";
import { PatientVisitCard } from './PatientVisitCard';
import { Button } from '../../Button/Button';
import { useCallback } from 'react';
import LoadingSpinner from '../../LoadingSpinner/LoadingSpinner';

export interface PatientQueueCardProps {
  className?: string;
  visitQueue: TelehealthVisit[];
  onDemandQueue: TelehealthVisit[];
  isNewVisit: boolean;
  setIsNewVisit: (isVisit:boolean) => void;
}

function calculateWaitTime(visitStartTimeLTZ) {
  const now : Date = new Date();
  const diffSeconds = Math.trunc((now.getTime() - visitStartTimeLTZ.getTime())/1000);
  const hhmmdd = Math.trunc(diffSeconds/60/60).toString().padStart(2,'0')
      + ':' + Math.trunc(diffSeconds/60).toString().padStart(2,'0')
      + ':' + Math.trunc(diffSeconds % 60).toString().padStart(2,'0');

  return (diffSeconds > 0 ? 'Waiting ': 'Starting ') + hhmmdd;
}

export const PatientQueueCard = ({ className, onDemandQueue, visitQueue, isNewVisit, setIsNewVisit }: PatientQueueCardProps) => {
  const refreshQueueCard = useCallback(() => {
      setIsNewVisit(false);
      window.location.reload();
    }, [setIsNewVisit]
  );

  return (
    <Card className={className}>
      <CardHeading>
        Patient Queue {"  "}{isNewVisit && 
        <Button onClick={refreshQueueCard}>
          Refresh
        </Button>
      }
      </CardHeading>
      {(onDemandQueue.length || visitQueue.length) ?
        <div>
          <div className="px-1 py-2 grid grid-cols-2 gap-4 font-bold text-xs">
            <div>Patient</div>
            <div>Reason For Visit:</div>
          </div>
          {onDemandQueue.map((visit, index) => (
            <PatientVisitCard visit={visit} key={index} index={index} waitTime={calculateWaitTime(visit.ehrAppointment.start_datetime_ltz)} isOnDemand={true}/>
          ))}
          {visitQueue.map((visit, index) => (
            <PatientVisitCard visit={visit} key={index} index={index} waitTime={calculateWaitTime(visit.ehrAppointment.start_datetime_ltz)} />
          ))}
        </div> :
        <LoadingSpinner/>
      }
    </Card>
  );
};
