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
import { ON_DEMAND_TOKEN, TEMP_TOKEN } from '../../../../constants';
import LoadingSpinner from '../../../../components/LoadingSpinner/LoadingSpinner';
import { createEHRPatient, getOnDemandToken } from '../../../../services/onDemandService';
import { OnDemandData, Token } from '../../../../interfaces';

/* 
* After landing on this page, a visitId should be created from EHR
* - Payment is valid, and POST request sent to EHR
* - EHR sends back a visitId
* - This page creats a token with the visitId attached
**/
const PaymentReceivedPage = () => {
  const router = useRouter();
  //const [tempToken, setTempToken] = useState<Token>(null);
  //const [tokenExists, setTokenExists] = useState<boolean>(false);
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

  // Generate Temporary Token to call patient/appointment APIs
  // useEffect(() => {
  //   const generateTempToken = async () => {
      
  //     await clientStorage.saveToStorage<Token>(TEMP_TOKEN, tempTokenObject);
  //   }
  //   generateTempToken();
  // }, [])
  

  // Publish the Message to Sync
  useEffect(() => {
    const publishMessage = async () => {
      const storageToken: Token = await getStorageToken();
      const tempToken = await getOnDemandToken();
      console.log(tempToken, storageToken, syncToken , syncClient , onDemandStream)
      if (storageToken) {
        await getStorageToken();
      }
      else if (tempToken && syncToken && syncClient && onDemandStream && !storageToken ) {
        const patientAppointment = await createEHRPatient(tempToken.token);
        const appointment = patientAppointment.appointment;
        const patient = patientAppointment.patient;
        onDemandStream.publishMessage({
          appointment: appointment,
          patient: patient,
          patientSyncToken: syncToken,
        })
        .then(async message => {
          const messageData = message.data as OnDemandData;
          const appt = await datastoreService.addAppointment(tempToken.token, messageData.appointment);
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
  }, [onDemandStream, router, syncClient, syncToken]);


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
