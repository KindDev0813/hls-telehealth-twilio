import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { Heading } from '../../../components/Heading';
import { InfoForm, Layout } from '../../../components/Patient';
import OnDemandLayout from '../../../components/Patient/OnDemandLayout';
import clientStorage from '../../../services/clientStorage';
import { PATIENT_INFO_KEY } from '../../../constants';
import { PatientInfo } from '../../../interfaces';

const InfoFormPage = () => {
  const router = useRouter();
  const submitInfo = useCallback(
    (patientInfoModel: PatientInfo) => {
      void clientStorage.saveToStorage(PATIENT_INFO_KEY, patientInfoModel);
      void router.push(`/patient/on-demand/health`);
    },
    [router],
  );
  
  return (
    <Layout>
      <Heading>Please Share Your Info</Heading>
      <InfoForm
        onSubmit={submitInfo}
      />
    </Layout>
  );
};

InfoFormPage.Layout = OnDemandLayout;
export default InfoFormPage;
