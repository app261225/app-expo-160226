import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

/**
 * DemoScreen — screen tujuan dari aksi NAVIGATE dan AUTOFILL.
 *
 * Saat dibuka via notifikasi AUTOFILL, params.autofill berisi
 * JSON string { name, email, message } yang langsung mengisi form.
 *
 * Saat dibuka via notifikasi NAVIGATE biasa, form kosong.
 */
export default function DemoScreen() {
  const params = useLocalSearchParams();

  // autofill dikirim sebagai JSON string dari NotificationService
  const autofillRaw = params?.autofill ?? null;
  const from = params?.from ?? null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [filled, setFilled] = useState(false);

  /**
   * Jika screen dibuka dengan params autofill,
   * parse JSON lalu isi semua field secara otomatis.
   */
  useEffect(() => {
    if (autofillRaw) {
      try {
        const autofill = JSON.parse(autofillRaw);
        setName(autofill.name ?? '');
        setEmail(autofill.email ?? '');
        setMessage(autofill.message ?? '');
        setFilled(true);
      } catch (e) {
        console.warn('[DemoScreen] Gagal parse autofill:', e);
      }
    }
  }, [autofillRaw]);

  const handleSubmit = () => {
    if (!name || !email) {
      Alert.alert('Validasi', 'Nama dan email wajib diisi.');
      return;
    }
    Alert.alert('✅ Form Terkirim', `Nama: ${name}\nEmail: ${email}\nPesan: ${message}`);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setMessage('');
    setFilled(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Banner info jika dibuka dari notifikasi NAVIGATE */}
      {from === 'notification' && !autofillRaw && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>📱 Dibuka dari notifikasi Navigate</Text>
        </View>
      )}

      {filled && (
        <View style={[styles.banner, styles.bannerSuccess]}>
          <Text style={styles.bannerText}>📝 Form diisi otomatis dari notifikasi</Text>
        </View>
      )}

      <Text style={styles.title}>Demo Form</Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Nama</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Masukkan nama"
          placeholderTextColor="#555"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Masukkan email"
          placeholderTextColor="#555"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Pesan</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={message}
          onChangeText={setMessage}
          placeholder="Masukkan pesan"
          placeholderTextColor="#555"
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity style={styles.btnSubmit} onPress={handleSubmit} activeOpacity={0.8}>
        <Text style={styles.btnText}>Kirim Form</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnReset} onPress={handleReset} activeOpacity={0.8}>
        <Text style={[styles.btnText, { color: '#AAA' }]}>Reset</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
    padding: 24,
    gap: 16,
  },
  banner: {
    backgroundColor: '#EDE7F6',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#6200EE',
  },
  bannerSuccess: {
    borderLeftColor: '#2A9D8F',
    backgroundColor: '#E0F2F1',
  },
  bannerText: {
    color: '#444',
    fontSize: 13,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginBottom: 8,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    color: '#555',
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    color: '#111',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#DEDEDE',
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  btnSubmit: {
    backgroundColor: '#6200EE',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  btnReset: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
});