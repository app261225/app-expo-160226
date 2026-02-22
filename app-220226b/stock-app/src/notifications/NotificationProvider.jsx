import React, { createContext, useContext, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import NotificationService from './NotificationService';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    (async () => {
      await NotificationService.init();
    })();

    // Fired saat notifikasi diterima & app sedang foreground
    const receivedListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[Provider] Received:', notification.request.content.data);
      }
    );

    /**
     * Fired saat user TAP notifikasi (dari foreground, background, maupun killed state).
     * Di sinilah action handler dipanggil — satu titik untuk semua aksi.
     */
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log('[Provider] Tapped, data:', data);
        NotificationService.handleAction(data);
      }
    );

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        NotificationService.resetPermissionCache();
      }
      appState.current = nextState;
    });

    return () => {
      receivedListener.remove();
      responseListener.remove();
      appStateSub.remove();
    };
  }, []);

  return (
    <NotificationContext.Provider value={NotificationService}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificationContext harus di dalam NotificationProvider');
  return ctx;
}