import { useContext } from 'react';
import { SyncContext } from '../';

export default function useSyncContext() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncContext must be used within SyncProvider');
  }
  return context;
}
