import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNotify } from '../notifications/useNotify';

export default function HomeScreen() {
  const {
    notify,
    notifyNavigate,
    notifyOpenUrl,
    notifyAlert,
    notifyFetch,
    notifyAutofill,
    cancelAll,
  } = useNotify();

  /**
   * Setiap tombol mengirim notifikasi dengan aksi berbeda.
   * Aksi baru terjadi saat notifikasi di-TAP, bukan saat dikirim.
   * Untuk test: minimize app dulu setelah tap tombol, lalu tap notifikasinya.
   *
   * Catatan Expo Router:
   * - screen name pakai pathname: '/demo' bukan 'Demo'
   */
  const BUTTONS = [
    {
      label: '🔔 General',
      color: '#6200EE',
      onPress: () =>
        notify('general', { body: 'Notifikasi biasa tanpa aksi.' }),
    },
    {
      label: '📱 Navigate ke Products',
      color: '#0077B6',
      onPress: () =>
        notifyNavigate('/(tabs)/products', { from: 'notification' }, {
          title: '📱 Buka Products',
          body: 'Tap untuk navigasi ke Products.',
        }),
    },
    {
      label: '🌐 Buka URL',
      color: '#2A9D8F',
      onPress: () =>
        notifyOpenUrl('https://expo.dev', {
          title: '🌐 Buka Expo',
          body: 'Tap untuk membuka expo.dev di browser.',
        }),
    },
    {
      label: '⚠️ Tampilkan Alert',
      color: '#E9C46A',
      onPress: () =>
        notifyAlert(
          'Halo dari Notifikasi!',
          'Ini adalah Alert yang dipicu dari tap notifikasi.',
          {
            title: '⚠️ Ada Pesan',
            body: 'Tap notifikasi untuk lihat pesannya.',
          }
        ),
    },
    {
      label: '🔄 Fetch API',
      color: '#E76F51',
      onPress: () =>
        notifyFetch(
          'https://jsonplaceholder.typicode.com/posts/1',
          'GET',
          {
            title: '🔄 Ambil Data API',
            body: 'Tap untuk fetch data dari JSONPlaceholder.',
          }
        ),
    },
    {
      label: '📝 Auto-fill Form',
      color: '#457B9D',
      onPress: () =>
        notifyAutofill(
          '/(tabs)/products',
          { name: 'Budi Santoso', email: 'budi@example.com', message: 'Diisi otomatis dari notifikasi!' },
          {
            title: '📝 Isi Form Otomatis',
            body: 'Tap untuk navigate & isi form secara otomatis.',
          }
        ),
    },
    {
      label: '❌ Cancel Semua',
      color: '#444',
      onPress: cancelAll,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Notification Actions</Text>
      <Text style={styles.subtitle}>
        Kirim notifikasi → minimize app → tap notifikasi
      </Text>

      {BUTTONS.map((btn) => (
        <Btn key={btn.label} {...btn} />
      ))}
    </ScrollView>
  );
}

function Btn({ label, color, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.btnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
  },
  btn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
});