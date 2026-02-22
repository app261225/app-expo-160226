# Progress Log — stock-app (Lanjutan dari progres-01b.md)

## Ringkasan Perubahan Besar dari 01b → 01c

`progres-01b.md` mendokumentasikan implementasi fitur inventory dasar (stock in/out) dengan notifikasi lokal, namun state stok masih tidak shared antar screen dan tidak ada persistence.
Dokumen ini mencatat **integrasi Ably (realtime messaging)** + **re-layout UI** berdasarkan desain yang didefinisikan di `UI UX.md`.

**Commit:** `f1a798f` — *"tambah ably dan re-layout"*

---

## Konteks Proyek
- **Tujuan:** Aplikasi inventory sederhana dengan local notification + realtime sync via Ably
- **Runtime:** Expo Go (tanpa Android Studio, tanpa EAS Build)
- **Platform target:** Android only
- **Expo SDK:** 53
- **Routing:** Expo Router

---

## Perubahan dari 01b

| Aspek | Sebelum (01b) | Sesudah (01c) |
|---|---|---|
| Realtime | Tidak ada | Ably Realtime terintegrasi |
| `src/ably/` | Tidak ada | `ablyClient.js`, `ablyService.js`, `useAblyChannel.js` |
| `app/_layout.jsx` | Hanya NotificationProvider | + inisialisasi Ably + LogBox suppressions |
| `DashboardScreen.jsx` | 4 summary card (data statis) | Re-layout sesuai `UI UX.md` (lebih lengkap) |
| `ProductsScreen.jsx` | List dasar + stock in/out | Re-layout: search bar + filter status + info jumlah produk + tombol tambah |
| `.gitignore` | Standard | + `.env` (untuk menyimpan Ably API key) |
| `UI UX.md` | Tidak ada | Ditambahkan — dokumen desain layout tab Dashboard & Produk |
| `package.json` | Tanpa Ably | + `ably` package |

---

## Struktur Folder Final (Current)

```
stock-app/
├── app/
│   ├── _layout.jsx                    ← + Ably connection init + LogBox suppressions
│   └── (tabs)/
│       ├── _layout.jsx
│       ├── index.jsx
│       ├── products.jsx
│       └── logs.jsx
├── assets/
├── src/
│   ├── ably/                          ← BARU
│   │   ├── ablyClient.js              ← singleton Ably Realtime client
│   │   ├── ablyService.js             ← publish/subscribe helpers
│   │   └── useAblyChannel.js          ← custom hook untuk subscribe channel
│   ├── notifications/
│   │   ├── notificationTypes.js
│   │   ├── NotificationService.js
│   │   ├── NotificationProvider.jsx
│   │   └── useNotify.js
│   ├── screens/
│   │   ├── DashboardScreen.jsx        ← re-layout
│   │   ├── ProductsScreen.jsx         ← re-layout + search + filter
│   │   └── LogsScreen.jsx
│   ├── components/
│   │   ├── ProductCard.jsx
│   │   └── StockBadge.jsx
│   └── data/
│       └── products.js
├── UI UX.md                           ← BARU — dokumen desain layout
├── tsconfig.json
├── .env                               ← BARU (di-gitignore) — Ably API key
├── app.json
└── package.json
```

**Yang ditambah dari 01b:**
- `src/ably/ablyClient.js` — singleton Ably Realtime client
- `src/ably/ablyService.js` — helper publish dan subscribe
- `src/ably/useAblyChannel.js` — custom hook untuk subscribe ke channel tertentu
- `UI UX.md` — dokumen desain wireframe layout tab Dashboard dan Produk
- `.env` — menyimpan `ABLY_API_KEY` (di-gitignore)

---

## Desain UI/UX (`UI UX.md`)

File `UI UX.md` mendefinisikan layout yang menjadi acuan re-layout di iterasi ini:

### Tab: Dashboard
```
[total_products, total_aman, total_menipis, total_habis]
[sum_in_today, count_in_today, sum_out_today, count_out_today]
[sum_total_in, count_total_in, sum_total_out, count_total_out]
[stamp_last_in, stamp_last_out]
```

### Tab: Products
```
[kotak_pencarian]
[tombol_filter_status: semua | aman | menipis | habis]
[jumlah_produk yang tampil, tombol tambah_products]
card: list_products: [sku, nama_products, harga_modal_non_rp, harga_modal_rp,
                      mata_uang_non_rp, harga_jual, stock_minimal, stock,
                      status{aman, menipis, habis}]
card bisa di-klik untuk edit (form edit = form tambah) + tombol hapus + tombol riwayat {in/out}
```

---

## Arsitektur (Updated)

```
Tap "Stock In" / "Stock Out" di ProductCard
      ↓
ProductsScreen → update state stok (useState)
      ↓
useNotify.notify() → NotificationService.send()      ← notifikasi lokal
      ↓
ablyService.publish(channel, event, data)             ← realtime sync
      ↓
useAblyChannel → subscriber lain menerima update
```

**Inisialisasi Ably di `app/_layout.jsx`:**
```js
ablyClient.connection.on('connected', () => {
  console.log('[Ably] Terhubung ✓');
});

ablyClient.connection.on('failed', (err) => {
  console.error('[Ably] Koneksi gagal:', err);
});
```

---

## File-by-File Summary

### `UI UX.md` *(baru)*
- Dokumen desain wireframe dalam format teks
- Mendefinisikan elemen-elemen UI untuk tab Dashboard dan tab Products
- Menjadi acuan re-layout di `DashboardScreen.jsx` dan `ProductsScreen.jsx`

### `.gitignore`
- Tambah entry `.env` agar API key Ably tidak ter-commit ke repository

### `package.json`
- Tambah dependency `ably` (Ably Realtime SDK untuk JavaScript/React Native)

### `app/_layout.jsx`
- Tambah `import { LogBox } from 'react-native'`
- Tambah `import ablyClient from '../src/ably/ablyClient'`
- `LogBox.ignoreLogs([...])` dipanggil di module level untuk suppress warning:
  - `'expo-notifications: Android Push notifications'`
  - `` '`expo-notifications` functionality is not fully supported' ``
- Listener koneksi Ably (`connected` dan `failed`) juga dipanggil di module level

### `src/ably/ablyClient.js` *(baru)*
- Singleton instance `Ably.Realtime` — dibuat sekali, digunakan di seluruh app
- Membaca API key dari environment variable (`.env`)
- Pola singleton: module di-load sekali oleh Metro bundler, instance tidak dibuat ulang

### `src/ably/ablyService.js` *(baru)*
- Helper functions untuk operasi Ably yang umum:
  - `publish(channelName, eventName, data)` — kirim pesan ke channel
  - `subscribe(channelName, eventName, callback)` — subscribe ke event di channel
  - `unsubscribe(channelName, eventName, callback)` — unsubscribe dari event

### `src/ably/useAblyChannel.js` *(baru)*
- Custom hook `useAblyChannel(channelName, eventName, callback)`
- Subscribe saat komponen mount, unsubscribe saat unmount (cleanup di `useEffect`)
- Memastikan tidak ada memory leak dari listener yang tertinggal

### `src/screens/DashboardScreen.jsx` *(re-layout)*
- Mengikuti struktur dari `UI UX.md`:
  - Baris 1: 4 card ringkasan stok (Total, Aman, Menipis, Habis)
  - Baris 2: 4 card aktivitas hari ini (sum_in, count_in, sum_out, count_out)
  - Baris 3: 4 card total keseluruhan (sum_total_in, count_total_in, sum_total_out, count_total_out)
  - Baris 4: timestamp aktivitas terakhir (last_in, last_out)

### `src/screens/ProductsScreen.jsx` *(re-layout)*
- Mengikuti struktur dari `UI UX.md`:
  - Search bar untuk filter produk berdasarkan nama/SKU
  - Filter status: Semua | Aman | Menipis | Habis
  - Info jumlah produk yang tampil + tombol Tambah Produk
  - `FlatList` card produk dengan field lengkap sesuai desain
  - Card bisa di-tap untuk edit
  - Setiap card ada tombol Hapus dan Riwayat in/out

---

## Issues yang Sudah Diselesaikan

| Issue | Penyebab | Fix |
|---|---|---|
| Warning spam `expo-notifications` di Expo Go | SDK 53 + Expo Go tidak support semua fitur notif native | `LogBox.ignoreLogs([...])` di `_layout.jsx` |
| API key Ably ter-expose di repo | Tidak ada `.env` di `.gitignore` | Tambah `.env` ke `.gitignore` |

---

## Known Limitations (Belum Diimplementasi)

| Keterbatasan | Keterangan |
|---|---|
| State tidak shared antar screen | Masih seperti 01b — stok di ProductsScreen tidak terrefleksi di DashboardScreen |
| Ably subscribe belum terhubung ke state | Ably sudah terpasang, tapi update dari channel belum mengubah state produk |
| Tidak ada persistence | Stok kembali ke awal setiap app di-restart |
| Tab Logs belum fungsional | Masih scaffold kosong |
| Form tambah/edit produk belum ada | Tombol Tambah sudah ada di layout, form belum diimplementasi |
| Riwayat in/out per produk belum ada | Tombol Riwayat sudah ada di card, layar riwayat belum dibuat |
| Harga produk belum ada di data | `products.js` belum punya field `harga_modal`, `harga_jual`, `mata_uang_non_rp` |
| `stock_minimal` belum ada di data | Field ini dirancang di UI UX.md tapi belum di dummy data |

---

## Rencana Iterasi Berikutnya

1. **Lengkapi model data** — tambah field `harga_modal`, `harga_jual`, `mata_uang_non_rp`, `stock_minimal` ke `products.js`
2. **Form tambah/edit produk** — modal atau bottom sheet dengan field sesuai `UI UX.md`
3. **Hapus produk** — konfirmasi dialog sebelum hapus
4. **Riwayat in/out per produk** — screen atau modal riwayat aktivitas stok per item
5. **Hubungkan Ably ke state** — saat menerima pesan dari channel, update state produk di semua screen
6. **Shared state** — Context atau state management agar Dashboard dan Products membaca data yang sama
7. **Persistence** — `AsyncStorage` agar stok tidak reset saat restart
8. **Tab Logs** — catat setiap aktivitas stock in/out + aktivitas Ably

---

## Cara Jalankan

```bash
# Buat file .env di root project (stock-app/)
echo "ABLY_API_KEY=your_ably_api_key_here" > .env

# Jalankan
npx expo start --clear
```

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
  "react-native": "0.76.x",
  "ably": "latest"
}
```

---

## Yang Sengaja TIDAK Digunakan
- FCM / remote push notification
- Backend / server custom
- Scheduled / delayed notification
- Dynamic require() dalam fungsi/useEffect
- Switch/if-else untuk action dispatch
- Android Studio / EAS Build
- `@react-navigation/native` dan `@react-navigation/native-stack`
- `navigationRef` global pattern
- `useColorScheme` / dark mode (force light)
- Redux / Zustand / state management eksternal (belum diperlukan)