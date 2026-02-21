// src/services/tokenService.js

import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'fcm_device_token';

// Simpan token ke storage lokal device
// Dipanggil setelah registerForPushNotificationsAsync berhasil
export async function saveToken(token) {
  try {
    const existing = await AsyncStorage.getItem(TOKEN_KEY);
    if (existing === token) {
      console.log('Token sama, tidak perlu update');
      return;
    }
    await AsyncStorage.setItem(TOKEN_KEY, token);
    console.log('Token tersimpan:', token);
  } catch (error) {
    console.error('Gagal simpan token:', error);
  }
}

// Baca token yang tersimpan
export async function getSavedToken() {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Gagal baca token:', error);
    return null;
  }
}

// Hapus token (misal saat user logout)
export async function clearToken() {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    console.log('Token dihapus');
  } catch (error) {
    console.error('Gagal hapus token:', error);
  }
}