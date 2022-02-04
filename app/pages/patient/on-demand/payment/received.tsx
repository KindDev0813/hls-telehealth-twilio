/* eslint-disable @next/next/no-img-element */
import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from '../../../../components/Alert';
import { Button } from '../../../../components/Button';
import { Layout } from '../../../../components/Patient';
import { useRouter } from 'next/router';
import { Uris } from '../../../../services/constants';
import useSyncContext from '../../../../components/Base/SyncProvider/useSyncContext/useSyncContext';
import OnDemandLayout from '../../../../components/Patient/OnDemandLayout';
import datastoreService from '../../../../services/datastoreService';
import { EHRAppointment, EHRPatient } from '../../../../types';
import clientStorage from '../../../../services/clientStorage';
import { HealthInfo, HEALTH_INFO_KEY, PatientInfo, PATIENT_INFO_KEY } from '../../../../constants';
import LoadingSpinner from '../../../../components/LoadingSpinner/LoadingSpinner';

export interface Token {
  passcode: string;
  token: string;
}

/* 
* After landing on this page, a visitId should be created from EHR
* - Payment is valid, and POST request sent to EHR
* - EHR sends back a visitId
* - This page creats a token with the visitId attached
**/
const PaymentReceivedPage = () => {
  const router = useRouter();
  const [passcode, setPasscode] = useState<string>(null);
  const [apptId, setApptId] = useState<string>('');
  const [patientId, setPatientId] = useState<string>('');
  const [appToken, setAppToken] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [appt, setAppt] = useState<EHRAppointment>(null);
  const { syncClient, syncToken, onDemandStream } = useSyncContext();
  
  async function getStorageToken() {
    const storageToken: Token = await clientStorage.getFromStorage('OnDemandToken');
    if (storageToken) setPasscode(storageToken.passcode);
    return storageToken;
  }
  
  const publishOnDemandVisit = useCallback(
    async (token: string) => {
      try {      
        const [patientInfo, healthInfo] = await Promise.all([
          clientStorage.getFromStorage(PATIENT_INFO_KEY),
          clientStorage.getFromStorage(HEALTH_INFO_KEY)
        ]) as [PatientInfo, HealthInfo];

        const ehrPatient: EHRPatient = {
          name: patientInfo.lastName,
          family_name: patientInfo.lastName,
          given_name: patientInfo.firstName,
          phone: patientInfo.phoneNumber,
          gender: patientInfo.gender
        }

        // combine calls to reduce latency time
        const [provider, patient] = await Promise.all([
          datastoreService.fetchProviderOnCall(token),
          datastoreService.addPatient(token, ehrPatient)
        ]);
        const appointment: EHRAppointment = {
          provider_id: provider.id,
          patient_id: patient.id,
          reason: healthInfo.reason,
          references: [],
        }
        setPatientId(patient.id);
        setAppt(appointment);
      } catch(err) {
        console.log(err);
        router.push('/patient/on-demand/info');
      }
    }, [router]);

  // The values in this fetch statement will be gathered from EHR integration
  useEffect(() => {
    async function generateFakeToken() {
      const tkn = await getStorageToken();
      if (!tkn) {
        fetch(Uris.get(Uris.visits.token), {
          method: 'POST',
          body: JSON.stringify({
            role: "patient",
            action: "PATIENT",
            id: "p1000000",
            visitId: "a1000000" // should be generated from EHR
          }),
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        })
        .then(async token => {
          const resolvedToken = await token.json();
          publishOnDemandVisit(resolvedToken.token);
          setAppToken(resolvedToken.token);
        }).catch(err => {
          setIsError(true);
          new Error(err);
        });
      }
    }
    generateFakeToken();
  }, [publishOnDemandVisit, syncToken]);

  // Will need to change this to real data get call.
  useEffect(() => {
    async function publishMessage() {
      const tkn = await getStorageToken();
      if (syncClient && onDemandStream && appt && syncToken && appToken && !tkn) {
        onDemandStream.publishMessage({
          appointment: appt,
          patientSyncToken: syncToken,
        })
        .then(async message => {
          //@ts-ignore
          const apptResp = await datastoreService.addAppointment(appToken, message.data.appointment);
          setApptId(apptResp.id);
        })
        .catch(error => {
          console.error('Stream publishMessage() failed', error);
        });
      }
    }
    publishMessage();
  }, [appToken, appt, onDemandStream, syncClient, syncToken]);

  useEffect(() => {
    async function generateOnDemandToken() {
      const tkn = await getStorageToken();
      if (appToken && patientId && apptId && !tkn) {
        fetch(Uris.get(Uris.visits.token), {
          method: 'POST',
          body: JSON.stringify({
            role: "patient",
            action: "PATIENT",
            id: patientId,
            visitId: apptId // should be generated from EHR
          }),
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        })
        .then(async token => {
          const resolvedToken = await token.json();
          clientStorage.saveToStorage('OnDemandToken', resolvedToken);
          setPasscode(resolvedToken.passcode);
        }).catch(err => {
          setIsError(true);
          new Error(err);
        });
      }
    }
    generateOnDemandToken();
  }, [appToken, apptId, patientId]);

  // No check needed because the payment is already validated
  const enterWaitingRoom = async () => {
    const tkn = await getStorageToken();
    console.log("my passcode", passcode, tkn);
    if (tkn && tkn.passcode) {
      router.push(`/patient?token=${tkn.passcode}`);
    } else {
      router.push(`/patient?token=${passcode}`);
    }
  }

  return (
    <Layout>
      <Alert
        title="Payment Received"
        icon={<img alt="Payment Success" src="/icons/payment-success.svg" height={98} width={135} />}
        contentBeforeIcon
        content={
          <>
            <p className="mb-6">
              We’ve received your payment information, and will be using it to
              process this visit. {passcode && 'Please wait while we process your appointment.'}
            </p>
          </>
        }
      />
      <div className="my-5 mx-auto max-w-[250px] w-full">
        {passcode ? 
            <Button type="submit" disabled={isError} className="w-full" onClick={enterWaitingRoom}>
              Connect to Waiting Room
            </Button> :
            <LoadingSpinner/>
        }
      </div>
    </Layout>
  );
};

PaymentReceivedPage.Layout = OnDemandLayout;
export default PaymentReceivedPage;
