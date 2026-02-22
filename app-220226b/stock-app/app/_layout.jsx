import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { NotificationProvider } from '../src/notifications/NotificationProvider';
import ablyClient from '../src/ably/ablyClient';

LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported',
]);

ablyClient.connection.on('connected', () => {
  console.log('[Ably] Terhubung ✓');
});

ablyClient.connection.on('failed', (err) => {
  console.error('[Ably] Koneksi gagal:', err);
});

export default function RootLayout() {
  return (
    <NotificationProvider>
      {/* translucent={false} → Android reservasi ruang status bar,
          konten tidak akan render di balik status bar */}
      <StatusBar style="dark" backgroundColor="#F5F5F5" translucent={false} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </NotificationProvider>
  );
}