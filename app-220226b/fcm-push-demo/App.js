import React from 'react';
import { NotificationProvider } from './src/notifications/NotificationProvider';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * Urutan wrap penting:
 * NotificationProvider (luar) → AppNavigator → NavigationContainer → screens
 *
 * NotificationProvider harus di luar NavigationContainer agar
 * response listener bisa dipanggil bahkan sebelum navigator mount,
 * namun navigationRef.navigate() tetap aman karena ada isReady() check.
 */
export default function App() {
  return (
    <NotificationProvider>
      <AppNavigator />
    </NotificationProvider>
  );
}