import React, { createContext, useContext, useEffect, useState } from 'react';
import { STORAGE_USER_KEY, STORAGE_VISIT_KEY } from '../constants';
import { GuestUser, TelehealthUser, TelehealthVisit } from '../types';
import clientStorage from '../services/clientStorage';

export interface VisitContextType {
  user: TelehealthUser,
  visit: TelehealthVisit,
  setVisit: (visit) => void,
}

export const VisitContext = createContext<VisitContextType>(null!);

export function VisitStateProvider(props: React.PropsWithChildren<{}>) {
  const [user, setUser] = useState<TelehealthUser>(GuestUser);
  const [visit,  setVisit] = useState<TelehealthVisit>(null);

  useEffect(() => {
    clientStorage.getFromStorage<TelehealthUser>(STORAGE_USER_KEY, GuestUser)
      .then(u => {
        if(u !== GuestUser) {
          setUser(u);
          return clientStorage.getFromStorage<TelehealthVisit>(STORAGE_VISIT_KEY);
        }
      })
      .then(v => setVisit(v));
  }, [setUser, setVisit]);

  return (
    <VisitContext.Provider value={{ user, visit, setVisit }}>
      {props.children}
    </VisitContext.Provider>
  );
}

export function VisitContextLayout(props: React.PropsWithChildren<{}>) {
  return (
    <VisitStateProvider>
      { props.children }
    </VisitStateProvider>
  );
}

export function useVisitContext() {
  const context = useContext(VisitContext);
  if (!context) {
    throw new Error('useVisitContext must be used within the VisitContextProvider');
  }
  return context;
}