import { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

/**
 * Custom hook to automatically keep tab data synced with the backend:
 * 1. Live WebSocket broadcasts (via SocketContext)
 * 2. Periodic background polling interval (default 10 seconds)
 * 3. Window focus and document visibility triggers
 */
export function useAutoSync(syncFn, { interval = 10000, enableSocket = true, enableFocus = true } = {}) {
  const socketContext = useSocket();
  const lastEvent = socketContext?.lastEvent;
  const syncFnRef = useRef(syncFn);

  useEffect(() => {
    syncFnRef.current = syncFn;
  }, [syncFn]);

  // 1. WebSocket real-time event auto-sync
  useEffect(() => {
    if (enableSocket && lastEvent && syncFnRef.current) {
      syncFnRef.current();
    }
  }, [lastEvent, enableSocket]);

  // 2. Periodic background polling
  useEffect(() => {
    if (!interval || interval <= 0) return;
    const intervalId = setInterval(() => {
      if (!document.hidden && syncFnRef.current) {
        syncFnRef.current();
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  // 3. Tab visibility / window focus auto-sync
  useEffect(() => {
    if (!enableFocus) return;

    const handleFocus = () => {
      if (syncFnRef.current) {
        syncFnRef.current();
      }
    };

    const handleVisibility = () => {
      if (!document.hidden && syncFnRef.current) {
        syncFnRef.current();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enableFocus]);
}

export default useAutoSync;
