// src/services/notificationService.js

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Konfigurasi tampilan notifikasi saat app di FOREGROUND
// shouldShowBanner & shouldShowList = API SDK 53+
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.warn('Push notifications hanya bekerja di device fisik!');
    return null;
  }

  // Channel dibuat DULU sebelum minta permission
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1A73E8',
      sound: 'default',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Permission notifikasi ditolak oleh user!');
    return null;
  }

  // getDevicePushTokenAsync → FCM native token
  // Tidak butuh EAS, tidak butuh project ID
  // Token ini langsung dipakai dengan service account + FCM HTTP v1 API
  const { data: fcmToken } = await Notifications.getDevicePushTokenAsync();
  console.log('FCM Token:', fcmToken);
  return fcmToken;
}