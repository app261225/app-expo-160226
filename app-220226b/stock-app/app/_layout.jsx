import { Stack } from 'expo-router';
import { LogBox } from 'react-native';
import { NotificationProvider } from '../src/notifications/NotificationProvider';
import ablyClient from '../src/ably/ablyClient';

// Harus di luar komponen, di module level
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
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </NotificationProvider>
  );
}