import React, { createContext, useCallback, useEffect, useState } from 'react';
import { SyncClient, SyncStream } from 'twilio-sync';

type SyncContextType = {
  syncToken: string;
  connect: (token: string) => void;
  syncClient: SyncClient;
  onDemandStream: SyncStream;
}

export const SyncContext = createContext<SyncContextType>(null);

export const SyncProvider: React.FC = ({children}) => {
  const [syncToken, setSyncToken] = useState<string>('');
  const [syncClient, setSyncClient] = useState<SyncClient>(null);
  const [onDemandStream, setOnDemandStream] = useState<SyncStream>(null);

  const connect = useCallback((token: string) => {
    try {
      const newSyncClient = new SyncClient(token);
      // @ts-ignore
      window.syncClient = newSyncClient;
      setSyncToken(token);
      setSyncClient(newSyncClient);
    } catch (err) {
      throw new Error(err);
    }
    
  }, []);

  useEffect(() => {
    if (syncClient) {
      syncClient.stream('OnDemandStream')
        .then(stream => {
          setOnDemandStream(stream);
        })
    }
  }, [syncClient])

  return (
    <SyncContext.Provider value={{syncToken, connect, syncClient, onDemandStream}} >
      {children}
    </SyncContext.Provider>
  );
}
