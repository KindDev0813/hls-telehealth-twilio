/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { Layout } from '../../../components/Patient';

const LeftWaitingRoom = () => {
  return (
    <Layout>
      <Alert
        title={`You’ve left the waiting room`}
        icon={<img alt="Rejoin Button" src="/icons/rejoin.svg" height={128} width={128} />}
        content={
          <p className="mt-8 mb-5">
            If you left the waiting room by accident, please rejoin below:
          </p>
        }
        footer={
          <>
            <Button
              as="a"
              href="/patient/waiting-room"
              className="my-1 max-w-[272px] w-full mx-auto"
            >
              Rejoin Waiting Room
            </Button>
          </>
        }
      />
    </Layout>
  );
};

export default LeftWaitingRoom;
