# Progress Log — fcm-push-demo (Lanjutan dari progres-00b.md)

## Ringkasan Perubahan Besar dari 00b → 01a

`progres-00b.md` mendokumentasikan project dengan **React Navigation manual** (`@react-navigation/native`).
Dokumen ini mencatat **migrasi ke Expo Router** + penambahan **Tab Navigation** + **Light Theme**.

---

## Konteks Proyek
- **Tujuan:** Aplikasi React Native dengan local notification + action system
- **Runtime:** Expo Go (tanpa Android Studio, tanpa EAS Build)
- **Platform target:** Android only
- **Expo SDK:** 53
- **Routing:** Expo Router (bukan React Navigation manual)

---

## Setup — Tambahan dari 00b

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

Package yang **dihapus / tidak lagi digunakan:**
- `@react-navigation/native`
- `@react-navigation/native-stack`

---

## Struktur Folder Final (Current)

```
fcm-push-demo/
├── app/
│   ├── _layout.jsx                    ← root layout, Stack + NotificationProvider
│   └── (tabs)/
│       ├── _layout.jsx                ← tab bar config (3 tab: Dashboard, Products, Logs)
│       ├── index.jsx                  ← tab Dashboard → re-export HomeScreen
│       ├── products.jsx               ← tab Products → re-export DemoScreen
│       └── logs.jsx                   ← tab Logs (placeholder, belum ada konten)
├── assets/
├── src/
│   ├── notifications/
│   │   ├── notificationTypes.js       ← CHANNELS, NOTIFICATION_ACTIONS, NOTIFICATION_TEMPLATES
│   │   ├── NotificationService.js     ← singleton service + ACTION_HANDLERS map
│   │   ├── NotificationProvider.jsx   ← context provider, listener, action dispatcher
│   │   └── useNotify.js               ← public hook dengan shorthand methods
│   └── screens/
│       ├── HomeScreen.jsx             ← konten tab Dashboard
│       └── DemoScreen.jsx             ← konten tab Products (form autofill)
├── app.json
└── package.json
```

**Yang dihapus dari 00b:**
- `App.js` → digantikan `app/_layout.jsx`
- `src/navigation/AppNavigator.jsx` → digantikan Expo Router
- `src/navigation/navigationRef.js` → digantikan `router` dari `expo-router`

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
router.push() / Linking.openURL() / Alert / fetch() / router.push()+autofill
```

**Prinsip desain:**
- `setNotificationHandler` — dipanggil sekali di module level (singleton)
- `ACTION_HANDLERS` — map object, bukan switch/if-else, mudah extend
- `router` dari `expo-router` — menggantikan `navigationRef` global pattern
- Permission cache — in-memory, reset saat AppState active
- `NotificationProvider` di `app/_layout.jsx` — listener aktif sebelum screen mount

---

## File-by-File Summary

### `app/_layout.jsx`
- Root layout — Stack navigator dengan `headerShown: false` untuk group `(tabs)`
- Wrap `NotificationProvider` di luar Stack
- Import `NotificationProvider` sebagai **named export** `{ NotificationProvider }`

```jsx
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
```

> ⚠️ PENTING: `NotificationProvider` adalah **named export**, bukan default export.
> Harus ditulis `{ NotificationProvider }`, bukan `NotificationProvider` tanpa kurung kurawal.

### `app/(tabs)/_layout.jsx`
- Tab bar dengan 3 tab: Dashboard, Products, Logs
- Icon dari `@expo/vector-icons` (Ionicons) — sudah include di Expo SDK, tidak perlu install
- Force light mode (warna hardcode, tidak menggunakan `useColorScheme`)

```
Dashboard → home-outline
Products  → cube-outline
Logs      → list-outline
```

### `app/(tabs)/index.jsx`
- Route tab Dashboard
- Re-export `HomeScreen` dari `src/screens/HomeScreen`

### `app/(tabs)/products.jsx`
- Route tab Products
- Re-export `DemoScreen` dari `src/screens/DemoScreen`

### `app/(tabs)/logs.jsx`
- Route tab Logs
- Placeholder — belum ada konten, siap diisi

### `src/notifications/notificationTypes.js`
- Tidak banyak berubah dari 00b
- Default `screen` di template `navigate` dan `autofill` diubah dari `'Demo'` → `'/demo'`
- ⚠️ Nilai `screen` di template hanya fallback — nilai aktual dikirim dari `useNotify`

### `src/notifications/NotificationService.js`
- `router` dari `expo-router` menggantikan `navigate` dari `navigationRef`
- Handler `NAVIGATE` dan `AUTOFILL` hardcode ke `'/(tabs)/products'`:

```js
// NAVIGATE
router.push({ pathname: '/(tabs)/products', params: data.screenParams ?? {} });

// AUTOFILL — fields di-stringify karena Expo Router hanya terima string sebagai params
router.push({
  pathname: '/(tabs)/products',
  params: { autofill: JSON.stringify(data.fields) },
});
```

### `src/notifications/NotificationProvider.jsx`
- Tidak berubah dari 00b
- Export: `{ NotificationProvider }` (named) dan `{ useNotificationContext }` (named)
- Tidak ada default export

### `src/notifications/useNotify.js`
- Tidak berubah dari 00b
- Public API: `notify`, `notifyNavigate`, `notifyOpenUrl`, `notifyAlert`, `notifyFetch`, `notifyAutofill`, `cancelAll`

### `src/screens/HomeScreen.jsx`
- Pathname diupdate ke format Expo Router tab group:
  - Navigate: `'/(tabs)/products'`
  - Autofill: `'/(tabs)/products'`
- Label tombol: "Navigate ke Demo" → "Navigate ke Products"
- Theme: light (`#F5F5F5` background, `#111` teks)

### `src/screens/DemoScreen.jsx`
- `route.params` (React Navigation) → `useLocalSearchParams()` dari `expo-router`
- `autofill` diterima sebagai JSON string, di-parse dengan `JSON.parse()`
- Theme: light (`#F5F5F5` background, input putih, teks gelap)

---

## Konfigurasi Wajib

### `package.json`
```json
{
  "main": "expo-router/entry"
}
```

### `app.json`
```json
{
  "expo": {
    "scheme": "fcm-push-demo",
    "userInterfaceStyle": "light",
    "plugins": [
      "expo-router",
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#ffffff",
          "defaultChannel": "default"
        }
      ]
    ]
  }
}
```

> ⚠️ Jangan duplikat `"expo-router"` di array plugins — pernah terjadi bug karena ini.

---

## Aksi yang Tersedia

| Aksi | Template | Efek saat di-tap | Target |
|---|---|---|---|
| `NONE` | `general`, `reminder` | tidak ada aksi | — |
| `NAVIGATE` | `navigate` | pindah ke tab Products | `/(tabs)/products` |
| `OPEN_URL` | `openUrl` | buka browser | URL eksternal |
| `ALERT` | `showAlert` | dialog di app | — |
| `FETCH` | `fetchData` | HTTP request + Alert hasil | — |
| `AUTOFILL` | `autofill` | pindah ke Products + isi form | `/(tabs)/products` |

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
| `Unable to resolve "@react-navigation/native"` | Package tidak ter-install | Migrasi ke Expo Router |
| Dual header / double navbar | Stack + Tab keduanya render header | `headerShown: false` di `Stack.Screen name="(tabs)"` |
| `Element type is invalid: got undefined` di `_layout.jsx` | `NotificationProvider` di-import sebagai default, padahal named export | Ganti ke `{ NotificationProvider }` |
| Duplicate `expo-router` di plugins | Copy-paste error di `app.json` | Hapus salah satu entry |
| Background gelap di light mode | Warna `#1A1A2E` hardcode di semua screen | Ganti ke `#F5F5F5` dan palet light |

---

## Cara Jalankan

```bash
npx expo start --clear
```

**Prosedur test aksi notifikasi:**
1. Tap tombol di tab Dashboard
2. Minimize app
3. Tap notifikasi di notification drawer
4. Aksi berjalan (navigate, alert, fetch, autofill, dll)

---

## Dependensi

```json
{
  "expo": "~53.x.x",
  "expo-notifications": "~0.29.x",
  "expo-router": "~4.x.x",
  "expo-linking": "~7.x.x",
  "expo-constants": "~17.x.x",
  "expo-status-bar": "~2.x.x",
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
- `@react-navigation/native` dan `@react-navigation/native-stack`
- `navigationRef` global pattern
- `useColorScheme` / dark mode (force light)

---

## Status Tab Logs
Tab Logs saat ini adalah **placeholder kosong** — hanya menampilkan teks "Belum ada konten".
Rencana pengisian: log notifikasi yang dikirim/diterima (belum diimplementasi).