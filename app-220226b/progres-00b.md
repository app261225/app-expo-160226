# Progress Log — fcm-push-demo (Local Notification Expo)

## Konteks Proyek
- **Tujuan:** Aplikasi React Native dengan local notification + action system
- **Runtime:** Expo Go (tanpa Android Studio, tanpa EAS Build)
- **Platform target:** Android only
- **Expo SDK:** 53

---

## Setup Awal

```bash
npx create-expo-app@latest fcm-push-demo --template blank
cd fcm-push-demo
npx expo install expo-notifications
npx expo install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
```

---

## Struktur Folder Final

```
fcm-push-demo/
├── assets/
├── src/
│   ├── notifications/
│   │   ├── notificationTypes.js       ← CHANNELS, NOTIFICATION_ACTIONS, NOTIFICATION_TEMPLATES
│   │   ├── NotificationService.js     ← singleton service + ACTION_HANDLERS map
│   │   ├── NotificationProvider.jsx   ← context provider, listener, action dispatcher
│   │   └── useNotify.js               ← public hook dengan shorthand methods
│   ├── navigation/
│   │   ├── navigationRef.js           ← global ref untuk navigate() dari luar React
│   │   └── AppNavigator.jsx           ← Stack navigator (Home + Demo)
│   └── screens/
│       ├── HomeScreen.jsx             ← tombol demo semua aksi notifikasi
│       └── DemoScreen.jsx             ← form target navigate & autofill
├── App.js                             ← NotificationProvider > AppNavigator
├── app.json
└── package.json
```

---

## Arsitektur

```
Tap Notifikasi
      ↓
NotificationProvider (responseListener)
      ↓
NotificationService.handleAction(data)
      ↓
ACTION_HANDLERS[data.action](data)    ← O(1) map lookup
      ↓
navigate() / Linking.openURL() / Alert / fetch() / navigate+autofill
```

**Prinsip desain:**
- `setNotificationHandler` — dipanggil sekali di module level (singleton)
- `ACTION_HANDLERS` — map object, bukan switch/if-else, mudah extend tanpa ubah logic lain
- `navigationRef` — global ref pattern resmi React Navigation untuk navigate dari luar komponen
- Permission cache — in-memory, reset saat AppState active
- `NotificationProvider` di luar `NavigationContainer` — listener aktif sebelum navigator mount

---

## File-by-File Summary

### `src/notifications/notificationTypes.js`
- Export `CHANNELS`: `DEFAULT`, `REMINDER`
- Export `NOTIFICATION_ACTIONS`: `NONE`, `NAVIGATE`, `OPEN_URL`, `ALERT`, `FETCH`, `AUTOFILL`
- Export `NOTIFICATION_TEMPLATES`: `general`, `navigate`, `openUrl`, `showAlert`, `fetchData`, `autofill`, `reminder`
- Tambah aksi baru: cukup tambah di file ini saja

### `src/notifications/NotificationService.js`
- Singleton dengan method: `init()`, `send()`, `handleAction()`, `cancelAll()`, `requestPermission()`, `hasPermission()`, `resetPermissionCache()`
- `ACTION_HANDLERS` map — O(1) dispatch tanpa switch/if-else
- `handleAction(data)` — entry point dari response listener
- Import `navigate` dari `navigationRef`

### `src/notifications/NotificationProvider.jsx`
- Static import di top-level
- `responseListener` memanggil `NotificationService.handleAction(data)`
- Cleanup semua listener di return useEffect
- Tidak ada props onReceived/onTapped — action handling internal

### `src/notifications/useNotify.js`
- Public API: `notify`, `notifyNavigate`, `notifyOpenUrl`, `notifyAlert`, `notifyFetch`, `notifyAutofill`, `cancelAll`
- Semua wrapped `useCallback`

### `src/navigation/navigationRef.js`
- `createNavigationContainerRef()` — global ref
- `navigate(name, params)` — dengan `isReady()` guard
- `getCurrentRoute()` — helper opsional

### `src/navigation/AppNavigator.jsx`
- `NavigationContainer` dengan `ref={navigationRef}`
- Stack: `Home` + `Demo`

### `src/screens/HomeScreen.jsx`
- 7 tombol data-driven (array of objects)
- Aksi terjadi saat notifikasi di-tap, bukan saat tombol ditekan

### `src/screens/DemoScreen.jsx`
- Form: name, email, message
- `useEffect` baca `route.params.autofill` → isi field otomatis
- Banner info jika dibuka dari notifikasi

### `App.js`
```
NotificationProvider
  └── AppNavigator (NavigationContainer + Stack)
```

---

## Aksi yang Tersedia

| Aksi | Template | Efek saat di-tap |
|---|---|---|
| `NONE` | `general`, `reminder` | tidak ada aksi |
| `NAVIGATE` | `navigate` | pindah ke screen |
| `OPEN_URL` | `openUrl` | buka browser |
| `ALERT` | `showAlert` | dialog di app |
| `FETCH` | `fetchData` | HTTP request + Alert hasil |
| `AUTOFILL` | `autofill` | pindah screen + isi form otomatis |

---

## Cara Tambah Aksi Baru

1. Tambah di `NOTIFICATION_ACTIONS` → `notificationTypes.js`
2. Tambah template di `NOTIFICATION_TEMPLATES` → `notificationTypes.js`
3. Tambah handler di `ACTION_HANDLERS` → `NotificationService.js`
4. (Opsional) Tambah shorthand di `useNotify.js`
5. Tidak ada file lain yang perlu diubah

---

## Issues yang Sudah Diselesaikan

| Issue | Penyebab | Fix |
|---|---|---|
| `shouldShowAlert` deprecated | SDK 53 | Ganti ke `shouldShowBanner` + `shouldShowList` |
| Metro bundler `Got unexpected undefined` | Dynamic `require()` dalam `useEffect` | Static import top-level |
| Alert tunda tidak muncul foreground | Perilaku normal Android | Fitur dihapus, semua immediate |

---

## Cara Jalankan

```bash
npx expo start --clear
```

**Prosedur test aksi:**
1. Tap tombol di HomeScreen
2. Minimize app
3. Tap notifikasi di drawer
4. Aksi berjalan

---

## Dependensi

```json
{
  "expo": "~53.x.x",
  "expo-notifications": "~0.29.x",
  "@react-navigation/native": "^6.x.x",
  "@react-navigation/native-stack": "^6.x.x",
  "react-native-screens": "~4.x.x",
  "react-native-safe-area-context": "^4.x.x",
  "react": "18.x.x",
  "react-native": "0.76.x"
}
```

---

## Yang Sengaja TIDAK Digunakan
- FCM / remote push notification
- Backend / server
- Scheduled / delayed notification
- Dynamic require() dalam fungsi/useEffect
- Switch/if-else untuk action dispatch
- Android Studio / EAS Build