import React, { useCallback, useEffect, useState } from 'react';
import useVideoContext from '../../../components/Base/VideoProvider/useVideoContext/useVideoContext';
import {
  AudioVideoCard,
  ContentManagementCard,
  InviteCard,
  Layout,
  PatientQueueCard,
} from '../../../components/Provider';
import { NextPatientCard } from '../../../components/Provider/NextPatientCard';
import { TelehealthVisit, TwilioPage } from '../../../types';
import ProviderVideoContextLayout from '../../../components/Provider/ProviderLayout';
import datastoreService from '../../../services/datastoreService';
import { EHRContent } from '../../../types';
import { useVisitContext } from '../../../state/VisitContext';
import useSyncContext from '../../../components/Base/SyncProvider/useSyncContext/useSyncContext';
import { Uris } from '../../../services/constants';
import { SyncStreamMessage } from 'twilio-sync';
import SurveyResultsCard from '../../../components/SurveyResultsCard/SurveyResultsCard';
import clientStorage from '../../../services/clientStorage';
import { FLEX_ENABLED_KEY } from '../../../constants';

const DashboardPage: TwilioPage = () => {
  
  const { getAudioAndVideoTracks } = useVideoContext();
  const [ mediaError, setMediaError] = useState<Error>();
  const [ visitNext, setVisitNext ] = useState<TelehealthVisit>(null);
  const [ visitQueue, setVisitQueue ] = useState<TelehealthVisit[]>([]);
  const [ onDemandQueue, setOnDemandQueue ] = useState<TelehealthVisit[]>([]);
  const [ contentAssigned, setContentAssigned ] = useState<EHRContent>();
  const [ contentAvailable, setContentAvailable ] = useState<EHRContent[]>([]);
  const [ isNewVisit, setIsNewVisit ] = useState<boolean>(false);
  const [ isFlexEnabled, setIsFlexEnabled ] = useState<boolean>(false);
  const { user } = useVisitContext();
  const { connect: syncConnect, syncClient, onDemandStream } = useSyncContext();

  const fetchVisits = useCallback(async () => {
    datastoreService.fetchAllTelehealthVisits(user)
      .then(async allVisits => {
        const onDemandVisits = allVisits.filter(visit => visit.ehrAppointment.type === 'WALKIN');
        const regularVisits = allVisits.filter(visit => visit.ehrAppointment.type !== 'WALKIN');
        setOnDemandQueue(onDemandVisits);
        setVisitQueue(regularVisits);
        setVisitNext(onDemandVisits.length ? onDemandVisits[0] : regularVisits[0]);
        console.log("ALLVISITS: ", allVisits)
      });
    }, [user]
  ); 

  // We use this to determine if telehealth is being called from an iFrame
  useEffect(() => {
    const getFlexEnabled = async () => {
      const flexEnabled = await clientStorage.getFromStorage(FLEX_ENABLED_KEY);
      if (flexEnabled && flexEnabled === 1) {
        setIsFlexEnabled(true);
      }
    }
    getFlexEnabled();
  }, []);

  // Gets Sync token to utilize Sync API prior to video room
  useEffect(() => {
    const getSyncToken = () => {
      fetch(Uris.get(Uris.visits.token), {
        method: 'POST',
        body: JSON.stringify({ action: "SYNC" }),
        headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
      }).then(async r => {
        const syncToken = await r.json();
        syncConnect(syncToken.token);
      });
    }
    if (!isFlexEnabled) getSyncToken();
  }, [isFlexEnabled, syncConnect]);

  useEffect(() => {
    if (!mediaError) {
      getAudioAndVideoTracks().catch(error => {
        console.dir(error);
        setMediaError(error);
      });
    }
  }, [getAudioAndVideoTracks, mediaError]);

  useEffect(() => {
    fetchVisits();
    datastoreService.fetchAllContent(user)
      .then(cArray => {         
        setContentAvailable(cArray);
        setContentAssigned(cArray.find((c) => {
          c.provider_ids.some(e => e === user.id);
        }));
      });
  }, [fetchVisits, user]);

  useEffect(() => {
    const publish = async (args: SyncStreamMessage) => {
      if (args) {
        console.log("message received", args);
        // @ts-ignore
        if (args.message.data.patientSyncToken) {
          setIsNewVisit(true);
        }
        fetchVisits();
      }
    }

    if (syncClient && onDemandStream) {
      onDemandStream.on('messagePublished', publish)
      return () => {
        onDemandStream.off('messagePublished', publish);
      }
    }
  }, [fetchVisits, onDemandStream, syncClient, user]);

  return (
    <Layout>
      {!isFlexEnabled ? 
        <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1" >
          <div>
            <NextPatientCard className="my-2" visitNext={visitNext} />
            <InviteCard />
          </div>
          <div>
            <PatientQueueCard className="my-2" onDemandQueue={onDemandQueue} visitQueue={visitQueue} isNewVisit={isNewVisit} setIsNewVisit={setIsNewVisit}/>
            <ContentManagementCard className="my-2" contentAssigned={contentAssigned} contentAvailable={contentAvailable}/>
            <SurveyResultsCard className="my-2"/>
          </div>
          <div className="order-first lg:order-last">
            <AudioVideoCard />
          </div>
        </div>
        : 
        <div>
          <AudioVideoCard visitNext={visitNext}/>
        </div>
      }
    </Layout>
  );
};
 
DashboardPage.Layout = ProviderVideoContextLayout;
export default DashboardPage;
