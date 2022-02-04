import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { Heading } from '../../../components/Heading';
import { InfoForm, Layout } from '../../../components/Patient';
import OnDemandLayout from '../../../components/Patient/OnDemandLayout';
import clientStorage from '../../../services/clientStorage';
import { PatientInfo, PATIENT_INFO_KEY } from '../../../constants';

const InfoFormPage = () => {
  const router = useRouter();
  const submitInfo = useCallback(
    (formValue: PatientInfo) => {
      clientStorage.saveToStorage(PATIENT_INFO_KEY, {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        phoneNumber: formValue.phoneNumber,
        email: formValue.email,
        needTranslator: formValue.needTranslator,
        gender: formValue.gender
      } as PatientInfo);
      
      router.push(`/patient/on-demand/health`);
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
