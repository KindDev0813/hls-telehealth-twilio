import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { Heading } from '../../../components/Heading';
import { HealthForm, Layout } from '../../../components/Patient';
import OnDemandLayout from '../../../components/Patient/OnDemandLayout';
import clientStorage from '../../../services/clientStorage';
import { HEALTH_INFO_KEY } from '../../../constants';
import { HealthInfo } from '../../../interfaces';

const HealthFormPage = () => {
  const router = useRouter();

  const submitHealthInfo = useCallback(
    (formValue: HealthInfo) => {
      clientStorage.saveToStorage(HEALTH_INFO_KEY, {
        conditions: formValue.conditions,
        medications: formValue.medications,
        reason: formValue.reason
      } as HealthInfo);

      router.push(`/patient/on-demand/insurance`);
    },
    [router],
  );

  return (
    <Layout>
      <Heading>About your health</Heading>
      <HealthForm
        onSubmit={submitHealthInfo}
      />
    </Layout>
  );
};

HealthFormPage.Layout = OnDemandLayout;
export default HealthFormPage;
