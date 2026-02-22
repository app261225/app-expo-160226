# Progress Log — stock-app (Lanjutan dari progres-01a.md)

## Ringkasan Perubahan Besar dari 01a → 01b

`progres-01a.md` mendokumentasikan project dengan nama `fcm-push-demo`, tab Products berisi form autofill demo, dan tab Logs masih placeholder kosong.
Dokumen ini mencatat **rename project ke `stock-app`** + **refactor struktur folder** + **implementasi fitur inventory (stock in/out)**.

---

## Konteks Proyek
- **Tujuan:** Aplikasi inventory sederhana dengan local notification terintegrasi
- **Runtime:** Expo Go (tanpa Android Studio, tanpa EAS Build)
- **Platform target:** Android only
- **Expo SDK:** 53
- **Routing:** Expo Router

---

## Perubahan dari 01a

| Aspek | Sebelum (01a) | Sesudah (01b) |
|---|---|---|
| Nama project | `fcm-push-demo` | `stock-app` |
| Nama folder | `fcm-push-demo/` | `stock-app/` |
| Tab Dashboard | 7 tombol notifikasi manual | Ringkasan stok (summary card) |
| Tab Products | Form autofill demo | List produk + stock in/out |
| Tab Logs | Placeholder kosong | Scaffold siap diisi |
| `HomeScreen.jsx` | Tombol-tombol demo | Dihapus → `DashboardScreen.jsx` |
| `DemoScreen.jsx` | Form nama/email/pesan | Dihapus → `ProductsScreen.jsx` |
| Notifikasi | Triggered manual dari tombol | Triggered otomatis saat stock in/out |
| `src/data/` | Tidak ada | `products.js` — dummy data produk |
| `src/components/` | Tidak ada | `ProductCard.jsx`, `StockBadge.jsx` |
| `tsconfig.json` | Tidak ada | Ditambahkan di root project |

---

## Struktur Folder Final (Current)

```
stock-app/
├── app/
│   ├── _layout.jsx                    ← root layout (NotificationProvider + Stack)
│   └── (tabs)/
│       ├── _layout.jsx                ← tab bar config (3 tab: Dashboard, Produk, Log)
│       ├── index.jsx                  ← tab Dashboard (re-export DashboardScreen)
│       ├── products.jsx               ← tab Produk (re-export ProductsScreen)
│       └── logs.jsx                   ← tab Log (re-export LogsScreen)
├── assets/
├── src/
│   ├── notifications/
│   │   ├── notificationTypes.js       ← CHANNELS, NOTIFICATION_ACTIONS, NOTIFICATION_TEMPLATES
│   │   ├── NotificationService.js     ← singleton service + ACTION_HANDLERS map
│   │   ├── NotificationProvider.jsx   ← context provider, listener, action dispatcher
│   │   └── useNotify.js               ← public hook dengan shorthand methods
│   ├── screens/
│   │   ├── DashboardScreen.jsx        ← ringkasan stok (ganti HomeScreen)
│   │   ├── ProductsScreen.jsx         ← list produk + stock in/out (ganti DemoScreen)
│   │   └── LogsScreen.jsx             ← scaffold log aktivitas (baru)
│   ├── components/
│   │   ├── ProductCard.jsx            ← card produk dengan tombol stock in/out
│   │   └── StockBadge.jsx             ← badge jumlah stok berwarna
│   └── data/
│       └── products.js                ← dummy data 5 produk
├── tsconfig.json                      ← baru, exclude node_modules dari TS checking
├── app.json
└── package.json
```

**Yang dihapus dari 01a:**
- `src/screens/HomeScreen.jsx` → digantikan `DashboardScreen.jsx`
- `src/screens/DemoScreen.jsx` → digantikan `ProductsScreen.jsx`

**Yang ditambah dari 01a:**
- `src/data/products.js` — sumber data produk, dipisah dari screen
- `src/components/ProductCard.jsx` — komponen reusable card produk
- `src/components/StockBadge.jsx` — komponen reusable badge stok
- `src/screens/LogsScreen.jsx` — screen baru (scaffold)
- `tsconfig.json` — konfigurasi TypeScript di root project

---

## Arsitektur

```
Tap "Stock In" / "Stock Out" di ProductCard
      ↓
ProductsScreen → update state stok (useState)
      ↓
useNotify.notify() → NotificationService.send()
      ↓
Local notification muncul (judul: Stock In / Stock Out)
      ↓
(Jika di-tap dari notification drawer)
      ↓
NotificationProvider → NotificationService.handleAction()
      ↓
ACTION_HANDLERS[data.action](data)
```

**Prinsip desain yang dipertahankan dari 01a:**
- `ACTION_HANDLERS` — map object, bukan switch/if-else
- `router` dari `expo-router` untuk navigasi
- `NotificationProvider` di `app/_layout.jsx`
- Named export `{ NotificationProvider }`

---

## File-by-File Summary

### `app.json`
- `name`, `slug`, `scheme` diubah dari `fcm-push-demo` → `stock-app`

### `package.json`
- `name` diubah dari `fcm-push-demo` → `stock-app`
- `main` tetap `expo-router/entry`

### `tsconfig.json` *(baru)*
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  },
  "exclude": [
    "node_modules"
  ]
}
```
- Ditambahkan untuk menghilangkan error VS Code TypeScript dari dalam `node_modules`
- `exclude: ["node_modules"]` mencegah TS Server membaca `tsconfig.json` milik library

### `src/data/products.js` *(baru)*
- Array `PRODUCTS` berisi 5 produk dummy
- Field per produk: `id`, `name`, `sku`, `stock`, `unit`, `category`
- Dipisah dari screen supaya kalau nanti diganti API, hanya file ini yang diubah

### `src/components/StockBadge.jsx` *(baru)*
- Menampilkan jumlah stok + status dengan warna:
  - 🔴 Merah — stok 0 (Habis)
  - 🟡 Kuning — stok 1–10 (Menipis)
  - 🟢 Hijau — stok >10 (Tersedia)
- Props: `stock`, `unit`

### `src/components/ProductCard.jsx` *(baru)*
- Menampilkan info produk: nama, SKU, kategori, badge stok
- Dua tombol: `+ Stock In` dan `− Stock Out`
- Tombol Stock Out di-disable otomatis saat stok 0 (mencegah stok negatif)
- Props: `product`, `onStockIn`, `onStockOut`

### `src/screens/DashboardScreen.jsx` *(ganti HomeScreen)*
- Menampilkan 4 summary card: Total Produk, Stok Aman, Stok Menipis, Stok Habis
- Data diambil dari `PRODUCTS` di `src/data/products.js`
- ⚠️ Catatan: saat ini data statis — belum reaktif terhadap perubahan stok di ProductsScreen

### `src/screens/ProductsScreen.jsx` *(ganti DemoScreen)*
- State produk dikelola dengan `useState(PRODUCTS)`
- `FlatList` untuk render list produk (virtualized, efisien untuk list panjang)
- `handleStockIn` — tambah stok +1, kirim notifikasi "Stock In"
- `handleStockOut` — kurang stok -1, kirim notifikasi "Stock Out", guard stok 0
- Semua handler di-wrap `useCallback`

### `src/screens/LogsScreen.jsx` *(baru)*
- Scaffold kosong, siap diisi log aktivitas stok
- Belum ada konten fungsional

### `app/(tabs)/_layout.jsx`
- Label tab diupdate: Dashboard, Produk, Log
- Icon: `grid-outline`, `cube-outline`, `list-outline`
- Warna aktif: `#1E8449` (hijau inventory)

### `app/(tabs)/index.jsx`
```jsx
export { default } from '../../src/screens/DashboardScreen';
```

### `app/(tabs)/products.jsx`
```jsx
export { default } from '../../src/screens/ProductsScreen';
```

### `app/(tabs)/logs.jsx`
```jsx
export { default } from '../../src/screens/LogsScreen';
```

---

## Issues yang Sudah Diselesaikan

| Issue | Penyebab | Fix |
|---|---|---|
| TS error `File 'expo-module-scripts/tsconfig.base' not found` | VS Code membaca `tsconfig.json` di dalam `node_modules` | Tambah `tsconfig.json` di root dengan `exclude: ["node_modules"]` |
| Nama tab "Products" tapi isi form "Demo" | Sisa dari iterasi sebelumnya | Rename + ganti konten ke list produk nyata |
| Notifikasi tidak terintegrasi dengan fitur | Notifikasi hanya tombol manual | Notifikasi dipicu otomatis saat stock in/out |

---

## Known Limitations (Belum Diimplementasi)

| Keterbatasan | Keterangan |
|---|---|
| State tidak shared antar screen | Stok berubah di ProductsScreen tidak terrefleksi di DashboardScreen — keduanya baca `PRODUCTS` secara terpisah |
| Tidak ada persistence | Stok kembali ke awal setiap kali app di-restart |
| Tab Logs belum fungsional | Hanya scaffold kosong |
| Stock in/out hanya +1/-1 | Belum ada input jumlah quantity |

---

## Rencana Iterasi Berikutnya

1. **Shared state** — pindahkan state produk ke Context atau state management supaya Dashboard dan Products membaca data yang sama
2. **Tab Logs** — catat setiap aktivitas stock in/out dengan timestamp
3. **Quantity input** — modal atau bottom sheet untuk input jumlah saat stock in/out
4. **Persistence** — simpan state stok ke `AsyncStorage` supaya tidak reset saat app restart

---

## Cara Jalankan

```bash
npx expo start --clear
```

**Prosedur test stock in/out:**
1. Buka tab Produk
2. Tap tombol `+ Stock In` atau `− Stock Out` pada salah satu card
3. Badge stok berubah langsung
4. Notifikasi lokal muncul
5. Minimize app → tap notifikasi di drawer → kembali ke app

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
- Redux / Zustand / state management eksternal (belum diperlukan)