import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NotificationProvider } from '../src/notifications/NotificationProvider';
import ablyClient from '../src/ably/ablyClient';

LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported',
]);

export default function RootLayout() {
  useEffect(() => {
    const onConnected = () => console.log('[Ably] Terhubung ✓');
    const onFailed = (err) => console.error('[Ably] Koneksi gagal:', err);
    ablyClient.connection.on('connected', onConnected);
    ablyClient.connection.on('failed', onFailed);
    return () => {
      ablyClient.connection.off('connected', onConnected);
      ablyClient.connection.off('failed', onFailed);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NotificationProvider>
        <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />
        <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
          <Stack.Screen name="index" />
        </Stack>
      </NotificationProvider>
    </SafeAreaProvider>
  );
}