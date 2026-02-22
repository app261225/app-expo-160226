import { createNavigationContainerRef } from '@react-navigation/native';

/**
 * navigationRef — ref global ke NavigationContainer.
 *
 * Tujuan: memungkinkan navigasi dipanggil dari LUAR komponen React,
 * yaitu dari NotificationService atau handler manapun yang tidak
 * punya akses ke navigation prop.
 *
 * Pattern ini adalah standar resmi React Navigation untuk deep linking
 * dan notification handling.
 */
export const navigationRef = createNavigationContainerRef();

/**
 * navigate() — wrapper aman yang cek isReady() sebelum navigasi.
 * Jika dipanggil sebelum navigator siap (misal: saat app cold start
 * dari tap notifikasi), navigasi akan di-skip dan log warning.
 *
 * @param {string} name   - nama screen (harus match dengan Stack.Screen name)
 * @param {object} params - params yang dikirim ke screen tujuan
 */
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    console.warn('[navigationRef] Navigator belum ready, navigasi di-skip:', name);
  }
}

/**
 * getCurrentRoute() — ambil nama screen aktif saat ini.
 * Berguna untuk conditional logic di notification handler.
 */
export function getCurrentRoute() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute()?.name;
  }
  return null;
}