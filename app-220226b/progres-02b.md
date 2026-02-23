# Progress Log — stock-app (Lanjutan dari progres-02a.md)

## Ringkasan Perubahan Besar dari 02a → 02b

`progres-02a.md` mendokumentasikan safe area fix, reimplementasi ProductsScreen, ConfigScreen lengkap, dan tab ke-4 (Konfig).
Dokumen ini mencatat **migrasi arsitektur navigasi dari Tab Navigator + Stack Navigator ke Custom Navigator berbasis hide/show**, refactor UI card produk, dan perbaikan UX header + dropdown menu.

---

## Konteks Proyek

- **Nama project:** `stock-app`
- **Tujuan:** Aplikasi inventory sederhana dengan local notification + realtime sync via Ably
- **Runtime:** Expo Go (tanpa Android Studio, tanpa EAS Build)
- **Platform target:** Android only
- **Expo SDK:** 54 (bukan 53 seperti yang terdokumentasi di 02a — actual install adalah SDK 54)
- **React Native:** 0.81.5
- **React:** 19.1.0
- **New Architecture:** enabled (`newArchEnabled: true` di `app.json`)
- **Edge to Edge:** enabled (`edgeToEdgeEnabled: true` di `app.json`)
- **Routing:** Expo Router v6 (dipertahankan sebagai root entry point, bukan untuk navigasi antar screen utama)
- **Persona aktif:** Principal Mobile Engineer — industry-grade, modular, best-practice driven

---

## Perubahan dari 02a

| Aspek | Sebelum (02a) | Sesudah (02b) |
|---|---|---|
| Arsitektur navigasi | Tab Navigator + Stack Navigator | Custom Navigator (hide/show pattern) di `RootScreen` |
| `app/(tabs)/` | Ada, berisi 4 route tab | **Dihapus seluruhnya** |
| `app/` route | `(tabs)` sebagai entry | `index.jsx` → `RootScreen`, tanpa route lain aktif |
| `app/_layout.jsx` | Stack dengan 4 `Stack.Screen` | Stack minimal, `headerShown: false`, hanya `index` |
| Header | Per-screen, inkonsisten | Satu header terpusat di `RootScreen`, seragam semua screen |
| Navigasi antar screen | `router.push()` → lag karena mount + animasi | `useState` toggle `display:none` → instan, zero-lag |
| Back button hardware | Expo Router default | `BackHandler` manual di `RootScreen` |
| Back logic | Selalu ke dashboard | `previousScreen` state — back kontekstual |
| Exit app | Langsung exit | `Alert.alert` konfirmasi sebelum `BackHandler.exitApp()` |
| Dropdown menu header | Tidak ada | `ellipsis-vertical` — menu per screen, kontekstual |
| `ProductsScreen` | Search bar + filter bar + tombol tambah + card verbose | Card ramping, tanpa search/filter/tambah |
| Harga modal/jual | Label teks + blok terpisah | Inline + icon (`calculator-outline`, `storefront-outline`) |
| Mata uang asing | Teks kode (JPY, USD, CNY) | Flag emoji Unicode (🇯🇵 🇺🇸 🇨🇳) — tidak butuh library |
| `products.js` | 5 produk dengan `null` di field mata uang | Semua 7 produk memiliki `harga_modal_non_rp` dan `mata_uang_non_rp` |
| Safe area | `SafeAreaProvider` missing → `insets.top` selalu 0 | `SafeAreaProvider` ditambahkan di `app/_layout.jsx` |
| Ably listener | Module level (memory leak saat hot reload) | `useEffect` dengan cleanup di `RootLayout` |

---

## Struktur Folder Final (Current)

```
stock-app/
├── app/
│   ├── _layout.jsx                    ← SafeAreaProvider + NotificationProvider + Stack minimal
│   ├── index.jsx                      ← re-export RootScreen
│   ├── config.jsx                     ← route tersisa (tidak aktif diakses via router)
│   ├── logs.jsx                       ← route tersisa (tidak aktif diakses via router)
│   └── products.jsx                   ← route tersisa (tidak aktif diakses via router)
├── src/
│   ├── ably/
│   │   ├── ablyClient.js              ← singleton Ably Realtime, EXPO_PUBLIC_ABLY_KEY
│   │   ├── ablyService.js             ← publish/subscribe helpers
│   │   └── useAblyChannel.js          ← custom hook subscribe channel
│   ├── notifications/
│   │   ├── notificationTypes.js
│   │   ├── NotificationService.js
│   │   ├── NotificationProvider.jsx
│   │   └── useNotify.js
│   ├── screens/
│   │   ├── RootScreen.jsx             ← BARU — custom navigator, header terpusat, dropdown
│   │   ├── DashboardScreen.jsx        ← summary 4 card + tombol Produk
│   │   ├── ProductsScreen.jsx         ← card ramping, FlatList, memo, tanpa search/filter
│   │   ├── LogsScreen.jsx             ← scaffold kosong
│   │   └── ConfigScreen.jsx           ← manajemen mata uang & kurs
│   ├── components/
│   │   ├── ProductCard.jsx            ← tidak digunakan (inline di ProductsScreen)
│   │   └── StockBadge.jsx             ← tidak digunakan (inline di ProductsScreen)
│   └── data/
│       ├── products.js                ← 7 produk, semua field lengkap, helper getStockStatus/formatRp
│       └── config.js                  ← DEFAULT_CURRENCIES, DEFAULT_KURS, helpers toIDR/formatForeign
├── .env                               ← EXPO_PUBLIC_ABLY_KEY (di-gitignore)
├── tsconfig.json
├── app.json
└── package.json
```

**Catatan:** `app/config.jsx`, `app/logs.jsx`, `app/products.jsx` masih ada di filesystem tapi tidak diakses secara aktif — navigasi sudah sepenuhnya dihandle oleh `RootScreen`. File ini sebaiknya dihapus di iterasi berikutnya untuk kebersihan routing.

**Yang sudah tidak digunakan:**
- `src/components/ProductCard.jsx` — komponen card produk kini inline di `ProductsScreen`
- `src/components/StockBadge.jsx` — badge kini inline di `ProductsScreen`

---

## Arsitektur Navigasi (Perubahan Kritis)

### Sebelum (02a): Tab + Stack
```
Expo Router Stack
  └── (tabs) — Tab Navigator
        ├── index     → DashboardScreen
        ├── products  → ProductsScreen
        ├── logs      → LogsScreen
        └── config    → ConfigScreen
```
**Masalah:** Navigasi via `router.push()` menyebabkan lag karena screen di-mount saat pertama kali diakses + animasi slide Stack.

### Sesudah (02b): Custom Navigator (hide/show)
```
Expo Router Stack (minimal, hanya sebagai entry)
  └── index → RootScreen
                ├── [Header terpusat]
                ├── DashboardScreen  ← display:none jika tidak aktif
                ├── ProductsScreen   ← display:none jika tidak aktif
                ├── LogsScreen       ← display:none jika tidak aktif
                └── ConfigScreen     ← display:none jika tidak aktif
```

**Cara kerja:**
- Semua 4 screen di-mount sekali saat app launch
- Perpindahan hanya toggle `display: 'none'` + `pointerEvents` di JS thread
- **Tidak ada mounting, tidak ada animasi, tidak ada bundle loading** — identik dengan cara kerja internal Tab Navigator
- Navigasi instan, zero-lag

### State Navigasi di RootScreen

```js
const [active, setActive]               = useState('dashboard');
const [previousScreen, setPreviousScreen] = useState('dashboard');
```

`navigate(to)` — fungsi terpusat, selalu mencatat `previousScreen` sebelum berpindah.
`handleBack()` — kembali ke `previousScreen`, bukan selalu ke dashboard.

**Tabel navigasi back yang kontekstual:**

| Dari | Ke | Tekan Back |
|---|---|---|
| Dashboard | — | Konfirmasi keluar app |
| Dashboard → Produk | Products | → Dashboard |
| Dashboard → menu Log | Logs | → Dashboard |
| Products → menu Log | Logs | → Products |
| Products → menu Konfig | Config | → Products |

### Hardware Back Button

```js
useEffect(() => {
  const handler = BackHandler.addEventListener('hardwareBackPress', () => {
    if (menuVisible) { setMenuVisible(false); return true; }
    if (!isDashboard) { handleBack(); return true; }
    Alert.alert('Keluar Aplikasi', 'Yakin ingin keluar?', [...]);
    return true;
  });
  return () => handler.remove();
}, [isDashboard, menuVisible, handleBack]);
```

Priority: tutup menu → back ke previousScreen → konfirmasi keluar.

---

## Arsitektur Header

Header seragam untuk semua screen, dirender satu kali di `RootScreen`:

```
[icon kiri] [title tengah] [ellipsis-vertical kanan]
```

- **Dashboard:** icon `home-outline` (non-interaktif), title "Dashboard"
- **Screen lain:** icon `arrow-back` (interaktif → `handleBack()`), title sesuai screen

Safe area ditangani via `useSafeAreaInsets()`:
```jsx
<View style={[styles.header, { paddingTop: insets.top + 10 }]}>
```

---

## Dropdown Menu

Diimplementasi dengan `Modal` + `Animated` dari React Native core — tidak butuh library eksternal.

**Cara posisi dropdown menempel ke header:**
```js
menuBtnRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
  setMenuAnchor({ top: pageY + height - 20, right: 8 });
});
```
`measure()` membaca posisi absolut tombol di layar saat runtime — akurat di semua ukuran device.

**Menu per screen (kontekstual):**
```js
const MENU_BY_SCREEN = {
  dashboard: [Log, Konfigurasi, Refresh],
  products:  [Log, Konfigurasi, Refresh],
  logs:      [Refresh],
  config:    [Refresh],
};
```

Animasi dropdown: `Animated.parallel` fade + translateY 120ms, `useNativeDriver: true`.

---

## File-by-File Summary

### `app/_layout.jsx` *(diupdate)*
```jsx
<SafeAreaProvider>                          // ← wajib untuk useSafeAreaInsets
  <NotificationProvider>
    <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="index" />
    </Stack>
  </NotificationProvider>
</SafeAreaProvider>
```
- `SafeAreaProvider` ditambahkan — fix bug kritis dari 02a
- Ably listener dipindah dari module level ke `useEffect` dengan cleanup
- `headerShown: false` — header dihandle sepenuhnya oleh `RootScreen`
- `animation: 'none'` — tidak ada animasi Stack

### `app/index.jsx`
```jsx
export { default } from '../src/screens/RootScreen';
```

### `src/screens/RootScreen.jsx` *(baru)*
Custom navigator. Berisi:
- State `active` dan `previousScreen`
- Fungsi `navigate()` terpusat
- Header seragam dengan safe area
- Body dengan 4 screen toggle `display:none`
- `BackHandler` dengan priority: menu → back → exit confirm
- `DropdownMenu` komponen dengan `Modal` + `Animated`
- `MENU_BY_SCREEN` map untuk menu kontekstual per screen

### `src/screens/DashboardScreen.jsx` *(diupdate)*
- Tidak ada `useSafeAreaInsets` — safe area dihandle di `RootScreen`
- Tidak ada custom header
- Navigasi via prop `onNavigate` (bukan `router.push`)
- Hanya satu tombol menu: Produk
- Log dan Konfigurasi diakses dari dropdown header

### `src/screens/ProductsScreen.jsx` *(reimplementasi)*
- **Dihapus:** SearchBar, FilterBar, tombol Tambah, state `search`/`filter`, `useMemo` filtering
- **Dipertahankan:** `useState(PRODUCTS)`, `useCallback` handler, `memo` pada ProductCard
- Card ramping — 4 baris: SKU+badge | nama | harga inline | stok
- Harga modal: icon `calculator-outline` + `formatRp` + flag emoji jika ada mata uang asing
- Harga jual: icon `storefront-outline` + `formatRp` (warna hijau)
- Flag emoji dari `FLAG_MAP` — Unicode regional indicator, tidak butuh library
- Fallback: `FLAG_MAP[code] ?? code` — tidak crash jika kode tidak ada di map
- `FlatList` langsung di root (tidak dibungkus `View`)
- Props FlatList: `initialNumToRender={7}`, `maxToRenderPerBatch={7}`, `windowSize={5}`, `removeClippedSubviews={true}`

### `src/data/products.js` *(diupdate)*
- Semua 7 produk memiliki `harga_modal_non_rp` dan `mata_uang_non_rp` terisi
- Produk 1–5: mata uang JPY, nilai dihitung dari `harga_modal_rp ÷ 150`, dibulatkan ke integer
- Produk 6: USD 2.1 (Teh Celup Import)
- Produk 7: CNY 18.5 (Kopi Bubuk Vietnam)
- Komentar kurs referensi ditambahkan di header file

**Kurs referensi yang digunakan saat konversi:**
- 1 JPY = 150 IDR

---

## Desain Decisions & Trade-offs

| Keputusan | Alasan |
|---|---|
| Custom Navigator vs Tab Navigator | Tab Navigator tidak support back button semantics. Custom navigator dengan hide/show identik secara performa dengan Tab Navigator — semua screen di-memory sejak launch |
| `previousScreen` satu level | Navigasi app ini tidak membutuhkan full stack history. Satu level cukup untuk semua skenario navigasi yang ada |
| Header di `RootScreen`, bukan per screen | Single source of truth untuk header — tidak ada risiko inkonsistensi, tidak ada duplikasi logic safe area |
| `measure()` untuk posisi dropdown | Kalkulasi statis tidak reliable di berbagai ukuran device dan status bar. `measure()` membaca posisi aktual di runtime |
| Flag emoji Unicode | Tidak butuh library, tidak butuh asset image, zero bundle size cost, dirender native oleh Android |
| FlatList langsung di root | Mengurangi satu layer View yang tidak perlu, performa lebih baik |
| `memo` pada ProductCard | Mencegah re-render card yang tidak berubah saat `setProducts` dipanggil |
| `display: 'none'` bukan `opacity: 0` | `opacity: 0` masih menerima touch event. `display: 'none'` benar-benar menyembunyikan dan dinonaktifkan. Dikombinasikan dengan `pointerEvents` untuk safety |

---

## Known Limitations (Belum Diimplementasi)

| Keterbatasan | Keterangan |
|---|---|
| State tidak shared antar screen | Stok di ProductsScreen tidak terrefleksi di DashboardScreen — keduanya baca `PRODUCTS` terpisah |
| Tidak ada persistence | Semua state reset saat app di-restart (stok, kurs, activeCode) |
| Tab Logs belum fungsional | Scaffold kosong |
| Form tambah/edit produk belum ada | Tombol Tambah dihapus dari ProductsScreen di iterasi ini |
| Tombol hapus per produk belum ada | Dirancang di UI UX.md tapi belum diimplementasi |
| Riwayat in/out per produk belum ada | Belum ada screen atau modal riwayat |
| Ably belum terhubung ke state produk | Koneksi aktif tapi publish/subscribe belum diimplementasi |
| `activeCode` di ConfigScreen tidak dikonsumsi ProductsScreen | Belum ada mekanisme share config ke screen lain |
| `src/components/ProductCard.jsx` dan `StockBadge.jsx` | Orphan files — tidak digunakan, belum dihapus |
| `app/config.jsx`, `app/logs.jsx`, `app/products.jsx` | Route lama — tidak diakses, sebaiknya dihapus |
| Dropdown menu `Refresh` | Placeholder — belum terhubung ke aksi nyata |
| `previousScreen` hanya satu level | Jika ada skenario navigasi lebih dari 2 level di masa depan, perlu diganti dengan array stack |

---

## Rencana Iterasi Berikutnya (02c)

1. **Shared state** — Context untuk state produk agar Dashboard dan Products reaktif terhadap data yang sama
2. **Form tambah produk** — Modal bottom sheet dengan field sesuai schema `products.js`
3. **Form edit produk** — Tap card di ProductsScreen membuka form edit
4. **Hapus produk** — Swipe atau long-press dengan konfirmasi dialog
5. **Tab Logs** — Catat setiap event stock in/out dengan timestamp, product name, jumlah
6. **Persistence** — `AsyncStorage` untuk produk, stok, kurs, dan `activeCode`
7. **Hubungkan Ably ke state** — Publish saat stock in/out, subscribe update dari device lain
8. **Refresh dari dropdown** — Terhubung ke aksi reload data aktual
9. **Bersihkan orphan files** — Hapus `app/config.jsx`, `app/logs.jsx`, `app/products.jsx`, `src/components/ProductCard.jsx`, `src/components/StockBadge.jsx`

---

## Cara Jalankan

```bash
npx expo start --clear
```

**Prosedur test navigasi:**
1. App terbuka di Dashboard
2. Tap tombol Produk → screen Produk muncul instan (zero-lag)
3. Tap `⋮` → dropdown muncul menempel di bawah header
4. Tap Log dari dropdown → screen Log (back → kembali ke Produk)
5. Tap hardware back → kembali ke screen sebelumnya
6. Dari Dashboard, hardware back → konfirmasi keluar

**Prosedur test stock in/out:**
1. Buka screen Produk
2. Tap `+` atau `-` pada card produk
3. Badge status berubah otomatis (aman/menipis/habis)
4. Notifikasi lokal muncul

---

## Dependensi

```json
{
  "expo": "~54.0.33",
  "expo-notifications": "~0.32.16",
  "expo-router": "~6.0.23",
  "expo-linking": "~8.0.11",
  "expo-constants": "~18.0.13",
  "expo-status-bar": "~3.0.9",
  "react-native-screens": "~4.16.0",
  "react-native-safe-area-context": "~5.6.2",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "ably": "^2.17.1"
}
```

---

## Yang Sengaja TIDAK Digunakan
- FCM / remote push notification
- Backend / server custom
- Scheduled / delayed notification
- Dynamic require() dalam fungsi/useEffect
- Switch/if-else untuk action dispatch (gunakan map object)
- Android Studio / EAS Build
- `@react-navigation/native` dan `@react-navigation/native-stack`
- `navigationRef` global pattern
- `useColorScheme` / dark mode (force light)
- Redux / Zustand / state management eksternal (belum diperlukan)
- Library bottom sheet eksternal (gunakan `Modal` + `Animated` dari RN core)
- `autoFocus` di dalam Modal Android (gunakan `ref.focus()` + `setTimeout`)
- Library flag emoji (gunakan Unicode regional indicator langsung)
- `router.push()` untuk navigasi antar screen utama (gunakan `RootScreen` navigate)