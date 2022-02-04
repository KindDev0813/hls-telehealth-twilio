/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import { Alert } from '../Alert';
import { Button, ButtonVariant } from '../Button';
import clientStorage from '../../services/clientStorage';
import { STORAGE_USER_KEY } from '../../constants';
import { TelehealthUser } from '../../types';
import router from 'next/router';

export interface DisconnectedAlertProps {
  role: string;
}

export const DisconnectedAlert = ({role}) => {
  
  const [userRole, setUserRole] = useState<string>('');
  
  useEffect(() => {
    clientStorage.getFromStorage<TelehealthUser>(STORAGE_USER_KEY)
        .then(user => setUserRole(user.role))
        .catch(error => {
          console.log(error);
          new Error("Error getting Telehealth User from Storage!");
        });
  }, []);

  function handleRejoin() {
    router.push(`/${userRole}/video`);
    console.log(userRole);
  }

  function handlePhoneConsultation() {
    // To-do: Add a router to phone consultation which should call the user on the phone
  }

  return (
    <Alert
      title={`You've lost connection\nto the visit`}
      icon={
        <img alt="Disconnected Phone" src="/icons/phone-disconnected.svg" height={128} width={128} />
      }
      content={
        <>
          <p className="mt-8 mb-5">
            Due to connection issues, you’ve been disconnected. Let’s get you
            back on track:
          </p>

          <p className="my-5">
            Rejoin the call or, if issues persist, you can switch to a phone
            consultation.
          </p>
        </>
      }
      footer={
        <>
          <Button
            className="my-1 max-w-[272px] w-full mx-auto"
            onClick={handleRejoin}
          >
            Rejoin Video Visit
          </Button>
          <Button
            className="my-1 max-w-[272px] w-full mx-auto"
            variant={ButtonVariant.secondary}
            outline
            onClick={handlePhoneConsultation}
          >
            Switch to Phone Consultation
          </Button>
        </>
      }
    />
  );
};
