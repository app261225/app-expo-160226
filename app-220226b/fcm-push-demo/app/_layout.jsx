import { Stack } from 'expo-router';
import { NotificationProvider } from '../src/notifications/NotificationProvider';

export default function RootLayout() {
  return (
    <NotificationProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </NotificationProvider>
  );
}