/* eslint-disable @next/next/no-img-element */
import router from 'next/router';
import React from 'react';
import { Alert } from '../../../components/Alert';
import useVideoContext from '../../../components/Base/VideoProvider/useVideoContext/useVideoContext';
import { Button, ButtonVariant } from '../../../components/Button';
import { Layout } from '../../../components/Patient';
import { requestPermissions } from '../../../utils';

const NoAvPermissionPage = () => {
  const getPermissionsClick = () => {
      requestPermissions()
      .then((allowed) => {
        if(allowed) {
          router.push("/patient/waiting-room");
        }
      });
    }
  return (
    <Layout>
      <Alert
        title={`To use Cloud City Healthcare, we need\nyour permissions`}
        icon={
          <img alt="No Audio/Video Permissions" src="/icons/no-av-permissions.svg" height={114} width={262} />
        }
        content={
          <>
            <p className="my-8 mb-5">
              In order to continue with a video visit, we need your permissions
              to use your camera and microphone.
            </p>

            <p className="my-5">
              If you prefer not to give permission, you canbtalk to the provider
              instead with a phone consultation.
            </p>
          </>
        }
        footer={
          <>
            <Button className="my-1 max-w-[272px] w-full mx-auto" onClick={getPermissionsClick}>
              Give Permission
            </Button>
            <Button
              className="my-1 max-w-[272px] w-full mx-auto"
              variant={ButtonVariant.secondary}
              outline
            >
              Switch to Phone Consultation
            </Button>
          </>
        }
      />
    </Layout>
  );
};

export default NoAvPermissionPage;
