/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import { Alert } from '../../../../components/Alert';
import { Button } from '../../../../components/Button';
import { Layout } from '../../../../components/Patient';
import { useRouter } from 'next/router';
import useSyncContext from '../../../../components/Base/SyncProvider/useSyncContext/useSyncContext';
import OnDemandLayout from '../../../../components/Patient/OnDemandLayout';
import datastoreService from '../../../../services/datastoreService';
import clientStorage from '../../../../services/clientStorage';
import { ON_DEMAND_TOKEN } from '../../../../constants';
import LoadingSpinner from '../../../../components/LoadingSpinner/LoadingSpinner';
import { createEHRPatient, getOnDemandToken } from '../../../../services/onDemandService';
import { OnDemandData, Token } from '../../../../interfaces';

interface PaymentReceivedPageProps {
  tempTokenObject: Token;
  tokenExists: boolean;
}

/* 
* After landing on this page, a visitId should be created from EHR
* - Payment is valid, and POST request sent to EHR
* - EHR sends back a visitId
* - This page creats a token with the visitId attached
**/
const PaymentReceivedPage = ({ tempTokenObject, tokenExists }: PaymentReceivedPageProps) => {
  const router = useRouter();
  const [passcode, setPasscode] = useState<string>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const { syncClient, syncToken, onDemandStream } = useSyncContext();
  
  async function getStorageToken() {
    const storageToken: Token = await clientStorage.getFromStorage(ON_DEMAND_TOKEN);
    if (storageToken) {
      setPasscode(storageToken.passcode);
    }
    return storageToken;
  }
  
  // No check needed because the payment is already validated
  const enterWaitingRoom = async () => {
    const tkn = await getStorageToken();
    if (tkn && tkn.passcode) {
      router.push(`/patient?token=${tkn.passcode}`);
    } else {
      router.push(`/patient?token=${passcode}`);
    }
  }

  // Publish the Message to Sync
  useEffect(() => {
    const publishMessage = async () => {
      const storageToken: Token = await getStorageToken();
      if (storageToken) {
        getStorageToken();
      } else if (tempTokenObject && syncToken && syncClient && onDemandStream && !tokenExists) {
        const patientAppointment = await createEHRPatient(tempTokenObject.token);
        const appointment = patientAppointment.appointment;
        const patient = patientAppointment.patient;
        onDemandStream.publishMessage({
          appointment: appointment,
          patient: patient,
          patientSyncToken: syncToken,
        })
        .then(async message => {
          const messageData = message.data as OnDemandData;
          const appt = await datastoreService.addAppointment(tempTokenObject.token, messageData.appointment);
          const onDemandToken = await getOnDemandToken(appt.patient_id, appt.id);
          await clientStorage.saveToStorage(ON_DEMAND_TOKEN, onDemandToken);
          setPasscode(onDemandToken.passcode);
        })
        .catch(error => console.error('Stream publishMessage() failed', error));
      } else {
        alert("Something Went Wrong! Please re-enter your information!");
        console.log("Null Sync Objects and OnDemand Token Present!")
        router.push('/patient/on-demand/info');
      }
    }
    publishMessage();
  }, [onDemandStream, router, syncClient, syncToken, tempTokenObject, tokenExists]);


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

export async function getServerSideProps() {
  // Call Token endpoint for a temp Token such that we can call
  // some functions that require a token
  const tempTokenObject = await getOnDemandToken();
  const tokenExists = await clientStorage.getFromStorage(ON_DEMAND_TOKEN) ? true : false;

  return { 
    props: {
      tempTokenObject: tempTokenObject,
      tokenExists
    }
  }
}

PaymentReceivedPage.Layout = OnDemandLayout;
export default PaymentReceivedPage;


  // // Will need to change this to real data get call.
  // useEffect(() => {
  //   async function publishMessage() {
  //     const tkn = await getStorageToken();
  //     if (syncClient && onDemandStream && appt && syncToken && appToken && !tkn) {
  //       onDemandStream.publishMessage({
  //         appointment: appt,
  //         patientSyncToken: syncToken,
  //       })
  //       .then(async message => {
  //         //@ts-ignore
  //         const apptResp = await datastoreService.addAppointment(appToken, message.data.appointment);
  //         setApptId(apptResp.id);
  //       })
  //       .catch(error => {
  //         console.error('Stream publishMessage() failed', error);
  //       });
  //     }
  //   }
  //   publishMessage();
  // }, [appToken, appt, onDemandStream, syncClient, syncToken]);

  // useEffect(() => {
  //   async function generateOnDemandToken() {
  //     const tkn = await getStorageToken();
  //     if (appToken && patientId && apptId && !tkn) {
  //       fetch(Uris.get(Uris.visits.token), {
  //         method: 'POST',
  //         body: JSON.stringify({
  //           role: "patient",
  //           action: "PATIENT",
  //           id: patientId,
  //           visitId: apptId // should be generated from EHR
  //         }),
  //         headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
  //       })
  //       .then(async token => {
  //         const resolvedToken = await token.json();
  //         clientStorage.saveToStorage('OnDemandToken', resolvedToken);
  //         setPasscode(resolvedToken.passcode);
  //       }).catch(err => {
  //         setIsError(true);
  //         new Error(err);
  //       });
  //     }
  //   }
  //   generateOnDemandToken();
  // }, [appToken, apptId, patientId]);