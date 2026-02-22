# Progress Log — stock-app (Lanjutan dari progres-01c.md)

## Ringkasan Perubahan Besar dari 01c → 02a

`progres-01c.md` mendokumentasikan integrasi Ably dan re-layout awal berdasarkan `UI UX.md`.
Dokumen ini mencatat **perbaikan safe area**, **reimplementasi ProductsScreen**, **penambahan tab Konfig**, dan **implementasi ConfigScreen** lengkap dengan manajemen mata uang dan kurs.

---

## Konteks Proyek
- **Tujuan:** Aplikasi inventory sederhana dengan local notification + realtime sync via Ably
- **Runtime:** Expo Go (tanpa Android Studio, tanpa EAS Build)
- **Platform target:** Android only
- **Expo SDK:** 53
- **Routing:** Expo Router
- **Persona aktif:** Principal Mobile Engineer — industry-grade, modular, best-practice driven

---

## Perubahan dari 01c

| Aspek | Sebelum (01c) | Sesudah (02a) |
|---|---|---|
| Safe area handling | `SafeAreaView` per screen → overlap status bar | `StatusBar translucent={false}` di root + `useSafeAreaInsets` di tab layout |
| `app/_layout.jsx` | Tanpa `StatusBar` | + `StatusBar style="dark" translucent={false}` |
| `app/(tabs)/_layout.jsx` | Tanpa inset handling | `useSafeAreaInsets().top` sebagai `paddingTop` wrapper |
| Semua screen | `SafeAreaView` dengan berbagai `edges` | `View` biasa — inset dihandle di layout level |
| `src/data/products.js` | Schema minimal (id, name, sku, stock, unit, category) | Schema lengkap + helper `getStockStatus`, `formatRp` |
| `ProductsScreen.jsx` | List dasar + stock in/out | Search bar + filter status + counter + tombol tambah + card detail |
| `src/data/config.js` | Tidak ada | Baru — mata uang, kurs, helpers `toIDR`, `getCurrencySymbol`, `formatForeign`, `formatRp` |
| Tab Konfig | Tidak ada | Ditambahkan — `app/(tabs)/config.jsx` + `ConfigScreen.jsx` |
| `app/(tabs)/_layout.jsx` | 3 tab | 4 tab (+ Konfig) |

---

## Struktur Folder Final (Current)

```
stock-app/
├── app/
│   ├── _layout.jsx                    ← StatusBar + NotificationProvider + Ably init + Stack
│   └── (tabs)/
│       ├── _layout.jsx                ← useSafeAreaInsets wrapper + 4 tab
│       ├── index.jsx                  ← re-export DashboardScreen
│       ├── products.jsx               ← re-export ProductsScreen
│       ├── logs.jsx                   ← re-export LogsScreen
│       └── config.jsx                 ← re-export ConfigScreen (BARU)
├── src/
│   ├── ably/
│   │   ├── ablyClient.js
│   │   ├── ablyService.js
│   │   └── useAblyChannel.js
│   ├── notifications/
│   │   ├── notificationTypes.js
│   │   ├── NotificationService.js
│   │   ├── NotificationProvider.jsx
│   │   └── useNotify.js
│   ├── screens/
│   │   ├── DashboardScreen.jsx        ← View biasa, tanpa SafeAreaView
│   │   ├── ProductsScreen.jsx         ← reimplementasi penuh
│   │   ├── LogsScreen.jsx             ← View biasa, tanpa SafeAreaView
│   │   └── ConfigScreen.jsx           ← BARU
│   ├── components/
│   │   ├── ProductCard.jsx
│   │   └── StockBadge.jsx
│   └── data/
│       ├── products.js                ← schema diperluas
│       └── config.js                  ← BARU
├── .env
├── tsconfig.json
├── app.json
└── package.json
```

---

## Arsitektur Safe Area (Perbaikan Kritis)

**Root cause masalah:** Android default `StatusBar` bersifat `translucent=true` — konten render di belakang status bar. Selain itu, `SafeAreaView` di masing-masing screen menyebabkan inkonsistensi dan duplikasi logic.

**Fix yang diterapkan:**

```
app/_layout.jsx
  └── <StatusBar translucent={false} />   ← reservasi ruang status bar di OS level

app/(tabs)/_layout.jsx
  └── <View paddingTop={insets.top}>      ← inset atas sekali untuk semua tab
        └── <Tabs />
```

**Prinsip:** inset adalah layout concern, bukan screen concern. Satu titik kontrol di layout level, semua tab otomatis inherit. Screen cukup `View` biasa.

**Tambahan wajib di `app.json`:**
```json
"android": {
  "softwareKeyboardLayoutMode": "pan"
}
```

---

## File-by-File Summary

### `app/_layout.jsx`
```jsx
import { StatusBar } from 'expo-status-bar';

// Di dalam RootLayout():
<StatusBar style="dark" backgroundColor="#F5F5F5" translucent={false} />
```
- `translucent={false}` — OS reservasi ruang fisik untuk status bar
- Ably connection listener dan `LogBox.ignoreLogs` tetap di module level (tidak berubah dari 01c)

### `app/(tabs)/_layout.jsx`
```jsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();
return (
  <View style={[styles.wrapper, { paddingTop: insets.top }]}>
    <Tabs ...>
      // 4 tab: Dashboard, Produk, Log, Konfig
    </Tabs>
  </View>
);
```
- Tab ke-4 ditambahkan: `name="config"`, icon `settings-outline`, label `Konfig`

### `app/(tabs)/config.jsx` *(baru)*
```jsx
export { default } from '../../src/screens/ConfigScreen';
```

### `src/screens/DashboardScreen.jsx`
- `SafeAreaView` → `View` biasa
- Tidak ada perubahan konten

### `src/screens/ProductsScreen.jsx` *(reimplementasi penuh)*

**Fitur yang diimplementasi:**
- Search bar — filter by nama produk atau SKU
- Filter status — Semua | Aman | Menipis | Habis (chip/pill)
- Counter — `{n} produk ditampilkan`
- Tombol Tambah — placeholder `Alert` untuk iterasi berikutnya
- `FlatList` card produk dengan field lengkap
- `ListEmptyComponent` — empty state saat filter tidak ada hasil

**Card produk menampilkan:**
- SKU (monospace) + badge status (Aman/Menipis/Habis)
- Nama produk + kategori
- Harga modal IDR + harga modal mata uang asing (jika ada) + harga jual
- Stok minimal + kontrol stock in/out (+/- tombol)

**State management:**
- `useState(PRODUCTS)` — list produk lokal
- `useState('')` — search query
- `useState('semua')` — filter aktif
- `useMemo` — derived filtered list, dihitung ulang hanya saat dependency berubah
- `useCallback` — semua handler di-memoize

**Logic filtering:**
```js
const filteredProducts = useMemo(() => {
  const q = search.toLowerCase().trim();
  return products.filter(p => {
    const matchSearch = q === '' || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    const matchFilter = filter === 'semua' || getStockStatus(p) === filter;
    return matchSearch && matchFilter;
  });
}, [products, search, filter]);
```

### `src/screens/LogsScreen.jsx`
- `SafeAreaView` → `View` biasa
- Tidak ada perubahan konten (masih scaffold)

### `src/data/products.js` *(schema diperluas)*

**Schema baru per produk:**
```js
{
  id: string,
  name: string,
  sku: string,
  category: string,
  unit: string,
  harga_modal_rp: number,        // harga modal dalam IDR
  harga_modal_non_rp: number|null, // harga modal dalam mata uang asing
  mata_uang_non_rp: string|null,  // kode mata uang, misal 'USD', 'CNY'
  harga_jual: number,
  stock_minimal: number,          // threshold stok menipis (per produk)
  stock: number,
}
```

**Helper yang ditambahkan:**
```js
// Status berbasis stock_minimal per produk (bukan hardcode angka 10)
export function getStockStatus(product) {
  if (product.stock === 0) return 'habis';
  if (product.stock <= product.stock_minimal) return 'menipis';
  return 'aman';
}

export function formatRp(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}
```

**Dummy data:** 7 produk (5 IDR-only, 2 dengan harga modal mata uang asing: USD dan CNY)

### `src/data/config.js` *(baru)*

Single source of truth untuk konfigurasi mata uang dan kurs.

```js
// Konvensi: 1 [mata_uang] = X IDR
export const DEFAULT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar',       symbol: '$'  },
  { code: 'CNY', name: 'Yuan Tiongkok',   symbol: '¥'  },
  { code: 'JPY', name: 'Yen Jepang',      symbol: '¥'  },
  { code: 'SGD', name: 'Dolar Singapura', symbol: 'S$' },
  { code: 'AUD', name: 'Dolar Australia', symbol: 'A$' },
];

export const DEFAULT_KURS = {
  USD: 16285.00,
  CNY:  2185.50,
  JPY:   110.23,
  SGD: 11950.00,
  AUD: 10320.00,
};

// Re-export alias agar tidak breaking existing imports
export const CURRENCIES = DEFAULT_CURRENCIES;
export const KURS       = DEFAULT_KURS;

// Helpers — menerima kurs/currencies dari state (bukan hanya DEFAULT)
export function toIDR(amount, currencyCode, kurs = DEFAULT_KURS)
export function getCurrencySymbol(currencyCode, currencies = DEFAULT_CURRENCIES)
export function formatForeign(amount, currencyCode, currencies = DEFAULT_CURRENCIES)
export function formatRp(amount)
```

**Desain keputusan:** helpers menerima parameter `kurs` dan `currencies` opsional sehingga bisa menerima state aktif dari `ConfigScreen`, tidak terikat ke nilai default.

### `src/screens/ConfigScreen.jsx` *(baru)*

**Layout:**
```
[Form Card — statis di atas]
  - Nama + kode mata uang yang sedang dipilih
  - Tag "Aktif untuk transaksi" ATAU tombol "Jadikan Aktif"
  - Divider
  - "1 [CODE] =" + nilai kurs (view-only atau input saat edit)
  - Tombol "Edit Kurs" (view mode) / "Batal" + "Simpan" (edit mode)

[Section: Pilih Mata Uang]
[Badge Grid — 5 per baris, full width]
  - Tap badge → data naik ke form
  - Badge aktif untuk transaksi → hijau solid + icon centang
  - Badge selected (ditampilkan di form) → outline hijau
  - Badge default → abu-abu
```

**State:**
```js
const [kurs,         setKurs        ] = useState(DEFAULT_KURS_EXTENDED);
const [activeCode,   setActiveCode  ] = useState('USD'); // untuk transaksi
const [selectedCode, setSelectedCode] = useState('USD'); // ditampilkan di form
const [isEditing,    setIsEditing   ] = useState(false);
const [inputVal,     setInputVal    ] = useState('');
```

**Dua konsep state yang berbeda:**
- `activeCode` — currency untuk transaksi tambah barang. Hanya berubah saat tap "Jadikan Aktif".
- `selectedCode` — currency yang sedang ditampilkan di form. Berubah setiap tap badge.

**Badge grid — kalkulasi lebar:**
```js
const BADGES_PER_ROW = 5;
const GRID_MARGIN    = 16;
const BADGE_GAP      = 8;
const BADGE_WIDTH    =
  (Dimensions.get('window').width - GRID_MARGIN * 2 - BADGE_GAP * (BADGES_PER_ROW - 1)) / BADGES_PER_ROW;
```
Badge menggunakan `width` eksplisit — bukan `flexBasis` atau `padding` variable — memastikan tepat 5 per baris tanpa sisa space termasuk pada baris terakhir yang jumlah badgenya kurang dari 5.

**10 mata uang tersedia di ConfigScreen:**
USD, CNY, JPY, SGD, AUD, EUR, GBP, MYR, THB, HKD

**Kurs extended (tambahan dari DEFAULT_KURS di config.js):**
```js
EUR: 17650.00, GBP: 20480.00, MYR: 3520.00, THB: 445.00, HKD: 2085.00
```

**Keyboard handling:**
- `KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` membungkus seluruh screen
- `inputRef.current?.focus()` dipanggil via `setTimeout(..., 80)` setelah state update — lebih reliable dari `autoFocus` di Android
- Pindah badge saat mode edit → edit di-cancel otomatis + `Keyboard.dismiss()`

---

## Desain Decisions & Trade-offs

| Keputusan | Alasan |
|---|---|
| `getStockStatus` berbasis `stock_minimal` per produk | Threshold stok menipis tidak sama untuk semua produk — beras 10 karung beda dengan sabun 2 botol |
| `useMemo` untuk filtered list | Filtering tidak perlu dijalankan ulang setiap render — hanya saat `products`, `search`, atau `filter` berubah |
| `Dimensions.get('window').width` di module level | Portrait-only Android — cukup dihitung sekali saat load. Jika perlu landscape, ganti ke `onLayout` |
| `activeCode` dan `selectedCode` dipisah | User bisa melihat/edit kurs currency manapun tanpa mengubah currency aktif untuk transaksi |
| Helpers di `config.js` terima parameter `kurs` opsional | Agar bisa menerima state kurs yang sudah diedit user, bukan hanya nilai default |
| Tidak ada external state management | State masih lokal per screen — belum ada kebutuhan shared state antar tab yang kompleks |

---

## Known Limitations (Belum Diimplementasi)

| Keterbatasan | Keterangan |
|---|---|
| State tidak shared antar screen | Stok di ProductsScreen tidak terrefleksi di DashboardScreen |
| Tidak ada persistence | Semua state reset saat app di-restart (stok, kurs, activeCode) |
| Tab Logs belum fungsional | Scaffold kosong |
| Form tambah/edit produk belum ada | Tombol Tambah di ProductsScreen hanya `Alert` placeholder |
| Tombol hapus & riwayat per produk belum ada | Dirancang di `UI UX.md` tapi belum diimplementasi |
| Ably belum terhubung ke state produk | Koneksi Ably sudah aktif tapi belum ada publish/subscribe untuk sync stok |
| `DashboardScreen` masih data statis | Membaca `PRODUCTS` langsung, tidak reaktif terhadap perubahan stok di ProductsScreen |
| `activeCode` di ConfigScreen tidak dikonsumsi ProductsScreen | Belum ada mekanisme share config ke screen lain |

---

## Rencana Iterasi Berikutnya (02b)

1. **Form tambah produk** — bottom sheet atau screen baru dengan field sesuai schema `products.js`
2. **Form edit produk** — tap card di ProductsScreen membuka form edit yang sama
3. **Hapus produk** — konfirmasi dialog + remove dari state
4. **Shared state** — Context untuk state produk dan config agar Dashboard reaktif dan ConfigScreen `activeCode` bisa dikonsumsi ProductsScreen
5. **Tab Logs** — catat setiap event stock in/out dengan timestamp
6. **Persistence** — `AsyncStorage` untuk produk, stok, dan config

---

## Cara Jalankan

```bash
npx expo start --clear
```

**Prosedur test ConfigScreen:**
1. Buka tab Konfig
2. Tap badge mata uang → data tampil di form atas
3. Tap "Edit Kurs" → form jadi editable, keyboard muncul, form terdorong naik
4. Isi nilai kurs → tap Simpan
5. Tap "Jadikan Aktif" untuk set currency transaksi
6. Badge yang aktif berwarna hijau solid dengan centang

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
- Library bottom sheet eksternal (gunakan `Modal` + `Animated` dari RN core)
- `autoFocus` di dalam Modal Android (gunakan `ref.focus()` + `setTimeout`)