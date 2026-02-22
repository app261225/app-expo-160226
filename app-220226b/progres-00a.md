# Progress Log — fcm-push-demo (Local Notification Expo)

## Konteks Proyek
- **Tujuan:** Aplikasi React Native sederhana dengan local notification (bukan FCM, bukan backend)
- **Runtime:** Expo Go (tanpa Android Studio, tanpa EAS Build)
- **Platform target:** Android only
- **Expo SDK:** 53

---

## Setup Awal

```bash
npx create-expo-app@latest fcm-push-demo --template blank
cd fcm-push-demo
npx expo install expo-notifications
```

---

## Struktur Folder Final

```
fcm-push-demo/
├── assets/
├── src/
│   ├── notifications/
│   │   ├── notificationTypes.js       ← template & channel constants
│   │   ├── NotificationService.js     ← singleton service (logic utama)
│   │   ├── NotificationProvider.jsx   ← context provider (setup sekali di root)
│   │   └── useNotify.js               ← hook untuk consumer
│   └── screens/
│       └── HomeScreen.jsx             ← UI utama
├── App.js                             ← root, wrap dengan NotificationProvider
├── app.json
└── package.json
```

---

## Arsitektur

```
NotificationService (singleton JS module)
        ↓
NotificationProvider (Context — mount sekali di App.js)
        ↓
useNotify() hook — dipanggil dari screen manapun
        ↓
HomeScreen — consumer, tidak tahu detail implementasi
```

**Prinsip desain:**
- `setNotificationHandler` dipanggil **tepat sekali** di module level (singleton)
- Android channel didaftarkan **tepat sekali** saat `init()` dengan flag `_initialized`
- Permission menggunakan **in-memory cache** `_permissionGranted` — tidak hit OS API berulang
- Listener hanya hidup di `NotificationProvider` — zero duplikasi
- `AppState` listener reset permission cache saat user balik dari background (kemungkinan ubah permission di Settings)

---

## File-by-File Summary

### `src/notifications/notificationTypes.js`
- Export `CHANNELS`: `DEFAULT`, `REMINDER`
- Export `NOTIFICATION_TEMPLATES`: `general`, `reminder`
- Untuk tambah jenis notifikasi baru → cukup tambah entry di file ini saja

### `src/notifications/NotificationService.js`
- Singleton object dengan method: `init()`, `send()`, `cancelAll()`, `requestPermission()`, `hasPermission()`, `resetPermissionCache()`
- `send()` selalu `trigger: null` (immediate) — tidak ada scheduled/delayed notification
- Channel Android: `default` (HIGH importance), `reminder` (DEFAULT importance)
- `priority: 'max'` di content untuk force display di Android

### `src/notifications/NotificationProvider.jsx`
- Static import `expo-notifications` di top-level (bukan dynamic `require()` — pernah jadi bug Metro bundler)
- `useEffect` menjalankan `init()` dengan async IIFE
- Listener: `addNotificationReceivedListener`, `addNotificationResponseReceivedListener`
- Cleanup listener di return `useEffect` untuk mencegah memory leak
- `AppState` listener untuk reset permission cache

### `src/notifications/useNotify.js`
- Expose hanya 2 method: `notify(type, params, channelId)` dan `cancelAll()`
- `notify` → wrapper `service.send()` dengan `trigger: null`
- Tidak ada `notifyLater` — fitur ini sengaja dihapus (kompleks, tidak reliable di Expo Go foreground)

### `src/screens/HomeScreen.jsx`
- 3 tombol: General, Reminder, Cancel Semua
- Import hanya `useNotify` — tidak ada import dari `notificationTypes` langsung
- Tidak ada state lokal, tidak ada handler async kompleks

### `App.js`
- Wrap `HomeScreen` dengan `NotificationProvider`
- Pass `onReceived` dan `onTapped` callback untuk logging
- Tidak ada perubahan dari template awal selain import ini

### `app.json`
- Platform: Android only
- Permissions: `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`, `VIBRATE`
- Plugin `expo-notifications` dengan `defaultChannel: "default"`
- `newArchEnabled: true`, `edgeToEdgeEnabled: true`

---

## Issues yang Sudah Diselesaikan

| Issue | Penyebab | Fix |
|---|---|---|
| `shouldShowAlert` deprecated | SDK 53 API change | Ganti ke `shouldShowBanner` + `shouldShowList` |
| `reading dataString is deprecated` | Internal Expo Go warning | Tidak perlu fix — akses via `.data` sudah benar |
| Metro bundler: `Got unexpected undefined` | Dynamic `require()` di dalam `useEffect` | Pindahkan ke static import top-level |
| Alert tunda tidak muncul saat foreground | Perilaku normal Android — scheduled notification butuh app di background | Fitur dihapus total dari codebase |

---

## Cara Jalankan

```bash
npx expo start --clear
```
Scan QR dengan Expo Go di HP Android.

> **Flag `--clear` wajib** setelah perubahan struktur — membersihkan Metro transform cache.

---

## API yang Digunakan (expo-notifications SDK 53)

```javascript
Notifications.setNotificationHandler()         // foreground display config
Notifications.setNotificationChannelAsync()    // Android channel setup
Notifications.getPermissionsAsync()            // cek status permission
Notifications.requestPermissionsAsync()        // minta permission runtime
Notifications.scheduleNotificationAsync()      // kirim notifikasi
Notifications.cancelAllScheduledNotificationsAsync() // cancel semua
Notifications.addNotificationReceivedListener()      // listener foreground
Notifications.addNotificationResponseReceivedListener() // listener tap
```

---

## Yang Sengaja TIDAK Digunakan
- ❌ FCM / remote push notification
- ❌ Backend / server
- ❌ Scheduled / delayed notification (`trigger: { seconds: N }`)
- ❌ `notifyLater`, `cancel(id)` — dihapus dari public API hook
- ❌ Alert channel (dihapus — hanya DEFAULT dan REMINDER)
- ❌ Dynamic `require()` di dalam fungsi/useEffect
- ❌ Android Studio / EAS Build

---

## Dependensi

```json
{
  "expo": "~53.x.x",
  "expo-notifications": "~0.29.x",
  "react": "18.x.x",
  "react-native": "0.76.x"
}
```

Cek versi aktual:
```bash
cat node_modules/expo-notifications/package.json | grep '"version"'
```