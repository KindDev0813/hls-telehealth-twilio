import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { STORAGE_USER_KEY } from '../../constants';
import clientStorage from '../../services/clientStorage';
import datastoreService from '../../services/datastoreService';
import { Reaction, TelehealthUser } from '../../types';
import { joinClasses } from '../../utils';
import { Alert } from '../Alert';
import { Button } from '../Button';
import { Chips } from '../Chips';
import { Icon } from '../Icon';
import { Textarea } from '../Textarea';

export interface VisitSurveyProps {
  isProvider?: boolean;
}

const OPTIONS = [
  { value: "Couldn't hear" },
  { value: "Other's couldn't hear" },
  { value: 'Video was low quality' },
  { value: 'Video froze or was choppy' },
  { value: "Couldn't see participants" },
  { value: "Sound didn't match video" },
  { value: "Participants couldn't see me" },
  { value: 'Other issue' },
];

export const VisitSurvey = ({ isProvider }: VisitSurveyProps) => {
  const router = useRouter();
  const [selectedThumb, setSelectedThumb] = useState<Reaction>(null);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [otherIssue, setOtherIssue] = useState<string>('');
  const [token, setToken] = useState<string>('');

  const ThumbIcon = ({icon}: {icon: Reaction}) => (
    <button
      type="button"
      onClick={async () => {
        setSelectedThumb(icon);
        if (icon === 'thumb_up') {
          datastoreService.addSurvey(token, {selectedThumb: icon, selectedIssues: [], otherIssue: ''});
          router.push(
            `/${isProvider ? 'provider' : 'patient'}/visit-survey/thank-you`
          );
        }
      }}
    >
      <Icon
        className={joinClasses(
          'text-4xl',
          icon === selectedThumb && 'text-primary'
        )}
        name={icon}
        outline
      />
    </button>
  );

  function resetForm() {
    setSelectedThumb(undefined);
    setSelectedIssues([]);
    setOtherIssue('');
  }

  function submitFeedback(event = null) {
    event?.preventDefault();
    datastoreService.addSurvey(token, {selectedThumb, selectedIssues, otherIssue})
    resetForm();
    router.push(
      `/${isProvider ? 'provider' : 'patient'}/visit-survey/thank-you`
    );
  }

  useEffect(() => {
    const getCurrentUser = async () => {
      const user = await clientStorage.getFromStorage<TelehealthUser>(STORAGE_USER_KEY);
      console.log(user);
      if (user) {
        user.token ? setToken(user.token) : setToken('');
      }
    }
    getCurrentUser();
  }, [])

  return (
    <Alert
      title="Thank you for your visit!"
      content={
        <form onSubmit={submitFeedback}>
          {isProvider ? (
            <p>If you don’t mind, could you tell us about your experience?</p>
          ) : (
            <p>
              We appreciate you scheduling a visit through the Owl Health app.
              If you don’t mind, could you tell us about how the visit went?
            </p>
          )}
          <p className="my-4 text-dark">How was the video and audio quality?</p>
          <div className="my-4 flex justify-evenly">
            <div>
              <ThumbIcon icon={"thumb_up"} />
            </div>
            <div>
              <ThumbIcon icon={"thumb_down"} />
            </div>
          </div>
          {selectedThumb === 'thumb_down' && (
            <div className="my-4">
              <Chips
                selected={selectedIssues}
                onChange={setSelectedIssues}
                options={OPTIONS}
              />
            </div>
          )}
          {selectedIssues.includes('Other issue') && (
            <div className="my-5">
              <Textarea
                className="w-full"
                rows={4}
                placeholder="Tell us more about the other issues you encountered during the call"
                setText={setOtherIssue}
              />
            </div>
          )}
          {selectedThumb === 'thumb_down' && !!selectedIssues.length && (
            <Button className="my-3" type="submit">
              Submit Feedback
            </Button>
          )}
        </form>
      }
    />
  );
};
