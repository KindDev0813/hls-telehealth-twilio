/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';
import React from 'react';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { CardLayout } from '../../../components/Provider';

const VisitSurveyThankYouPage = () => {
  const router = useRouter();
  const goToDashBoard = () => {
    router.push('/provider/dashboard/');
  }
  return (
    <CardLayout>
      <Alert
        title={`Thanks for your feedback`}
        titleAfterIcon
        icon={<img alt="Circle with Check" src="/icons/check-circle.svg" height={75} width={75} />}
        content={
          <p className="">You can close this window now or<br/>
            <Button
              className="mt-3" 
              onClick={goToDashBoard}
            >
              Go to Dashboard
            </Button> 
          </p>
        }
      />
    </CardLayout>
  );
};

export default VisitSurveyThankYouPage;
