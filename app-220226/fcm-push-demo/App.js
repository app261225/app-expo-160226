// App.js

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './src/services/notificationService';
import { saveToken } from './src/services/tokenService';

export default function App() {
  const [fcmToken, setFcmToken] = useState('');
  const [notification, setNotification] = useState(null);

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Dapatkan FCM token & simpan ke AsyncStorage
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setFcmToken(token);
        saveToken(token); // simpan lokal, tidak ada backend
      }
    });

    // Listener: notifikasi diterima saat app di FOREGROUND
    notificationListener.current = Notifications.addNotificationReceivedListener(
      notification => {
        console.log('Notifikasi foreground:', notification);
        setNotification(notification);
      }
    );

    // Listener: user TAP notifikasi
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      response => {
        console.log('User tap notifikasi:', response);
      }
    );

    return () => {
      notificationListener.current.remove();
      responseListener.current.remove();
    };
  }, []);

  // Test notifikasi lokal (tidak butuh FCM, tidak butuh internet)
  const sendLocalNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Lokal 🎉',
        body: 'Notifikasi lokal berhasil — tidak melalui FCM',
        data: { screen: 'Home' },
      },
      trigger: { seconds: 2 },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>FCM Push Notification Demo</Text>

      {/* FCM Token — copy untuk dipakai di send-notif.js */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>FCM Device Token:</Text>
        <Text style={styles.token} selectable>
          {fcmToken || 'Memuat token...'}
        </Text>
        <Text style={styles.hint}>Tap & hold untuk copy token</Text>
      </View>

      {/* Notifikasi terakhir yang diterima di foreground */}
      {notification && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notifikasi Terakhir (Foreground):</Text>
          <Text style={styles.notifTitle}>
            {notification.request.content.title}
          </Text>
          <Text style={styles.notifBody}>
            {notification.request.content.body}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={sendLocalNotification}>
        <Text style={styles.buttonText}>Test Notifikasi Lokal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#F5F5F5' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 24 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  token: { fontSize: 11, color: '#D63031', fontFamily: 'monospace', lineHeight: 18 },
  hint: { fontSize: 11, color: '#999', marginTop: 4 },
  notifTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A2E' },
  notifBody: { fontSize: 14, color: '#444', marginTop: 4 },
  button: { backgroundColor: '#1A73E8', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});