import { joinClasses } from '../../../utils';
import { useEffect, useState } from 'react';
import { Button } from '../../Button';
import { Card } from '../../Card';
import { CardHeading } from '../CardHeading';
import { Icon } from '../../Icon';
import { useRouter } from 'next/router';
import clientStorage from '../../../services/clientStorage';
import {CURRENT_VISIT, STORAGE_VISIT_KEY} from '../../../constants';
import {TelehealthVisit} from "../../../types";
import LoadingSpinner from '../../LoadingSpinner/LoadingSpinner';
import { CurrentVisit } from '../../../interfaces';
import WaitTimer from '../../WaitTimer/WaitTimer';

export interface NextPatientCardProps {
  className?: string;
  visitNext: TelehealthVisit;
}

export const NextPatientCard = ({ className, visitNext }: NextPatientCardProps) => {

  const router = useRouter();
  const [ visitNeedTranslator, setVisitNeedTranslator ] = useState<string>();

  const Field = ({ label, value }) => (
    <li className="my-4 text-xs">
      <label className="font-bold">{label}:</label>
      <div
        className={joinClasses(
          'text-dark',
          value && value.match(/\s/) ? '' : 'inline-block ml-1'
        )}
      >
        {value}
      </div>
    </li>
  );

  function startVisit() {
    const currVisit: CurrentVisit = {
      visitId: visitNext.ehrAppointment.id,
      visitType: visitNext.ehrAppointment.type
    }
    clientStorage.saveToStorage<CurrentVisit>(CURRENT_VISIT, currVisit);
    router.push("/provider/video/");
  };

  useEffect(() => {
    if (visitNext) {
      clientStorage.saveToStorage(STORAGE_VISIT_KEY, visitNext);
      setVisitNeedTranslator(visitNext.ehrPatient.language === 'English' ? 'No' : 'Yes');
    }
  }, [visitNext]);

  return (
    <Card className={className}>
      <div>
        <div className="font-bold text-xs">Next Patient:</div>
        {visitNext ?
          <div>
            <CardHeading>{visitNext.ehrPatient?.name}</CardHeading>
            <WaitTimer startTime={visitNext.ehrAppointment.start_datetime_ltz.getTime()}/>
            <ul className="pl-5">
              <Field label="Reason for Visit" value={visitNext.ehrAppointment.reason} />
              <Field label="Gender" value={visitNext.ehrPatient?.gender} />
              <Field label="Language" value={visitNext.ehrPatient?.language} />
              <Field label="Translator" value={visitNeedTranslator} />
              <Field label="Preexisting Conditions" value={visitNext.ehrPatient.conditions[0]}/>
              <Field label="Current Medications" value={visitNext.ehrPatient.medications[0]}/>
              {visitNext.ehrAppointment.references.length > 0 ? (
                <li>
                  <label className="text-bold">Attached Files:</label>
                  {visitNext.ehrAppointment.references.map((e, i) => (
                    <a
                      key={i}
                      className="flex rounded-lg my-3 border border-link py-3 px-4 text-link text-xs items-center cursor-pointer"
                      href={"http://localhost:3000/" + e}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="flex-grow underline">{e.replace(/^.*[\\\/]/, '')}</span>
                      <Icon name="file_download" outline />
                    </a>
                  ))}
                </li>
              ) : (
                <Field label="Attached Files" value="None" />
              )}
            </ul>
            <div className="mt-5 text-center">
              <Button as="button" onClick={startVisit}>
                Start Visit
              </Button>
            </div>
          </div> :
          <LoadingSpinner/>
        }
      </div>
    </Card>
  );
};
