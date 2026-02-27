# Progress Log — stock-app 02c
> Dokumen resmi konteks project. Dibaca model LLM sebelum melakukan apapun.
> Jika butuh isi file spesifik, **minta ke user** — jangan asumsikan.

---

## Cara Menggunakan Dokumen Ini

1. Baca seluruh dokumen ini dulu sebelum menulis kode apapun.
2. Jika butuh isi file yang belum ada di konteks, minta user untuk mengirimnya.
3. Jangan asumsikan isi file berdasarkan nama — selalu minta file aslinya.
4. Semua keputusan arsitektur di sini sudah final kecuali user mengubahnya.

---

## Identitas Project

| Key | Value |
|---|---|
| Nama | `stock-app` |
| Tujuan | Aplikasi inventory sederhana, Android-only |
| Environment | Expo Go (managed workflow) — **tidak ada EAS Build, tidak ada Android Studio** |
| Expo SDK | 54 (actual install, bukan 53) |
| React Native | 0.81.5 |
| React | 19.1.0 |
| Expo Router | ~6.0.23 |
| New Architecture | `newArchEnabled: true` |
| Edge to Edge | `edgeToEdgeEnabled: true` |
| Platform | Android only |

---

## Struktur Folder (Current)

```
stock-app/
├── app/
│   ├── _layout.jsx              ← Root: SafeAreaProvider + NotificationProvider + Stack minimal
│   ├── index.jsx                ← Entry point: re-export RootScreen
│   ├── config.jsx               ← Orphan route (tidak aktif) — kandidat hapus
│   ├── logs.jsx                 ← Orphan route (tidak aktif) — kandidat hapus
│   └── products.jsx             ← Orphan route (tidak aktif) — kandidat hapus
├── src/
│   ├── ably/
│   │   ├── ablyClient.js        ← Singleton Ably Realtime, env: EXPO_PUBLIC_ABLY_KEY
│   │   ├── ablyService.js       ← publish/subscribe helpers
│   │   └── useAblyChannel.js    ← custom hook subscribe channel
│   ├── notifications/
│   │   ├── notificationTypes.js
│   │   ├── NotificationService.js
│   │   ├── NotificationProvider.jsx
│   │   └── useNotify.js
│   ├── screens/
│   │   ├── RootScreen.jsx       ← Custom navigator (hide/show pattern)
│   │   ├── DashboardScreen.jsx  ← Summary 4 card + tombol Produk
│   │   ├── ProductsScreen.jsx   ← List produk (FlatList + search bar bottom)
│   │   ├── LogsScreen.jsx       ← Scaffold kosong
│   │   └── ConfigScreen.jsx     ← Manajemen mata uang & kurs
│   ├── components/              ← Orphan (tidak digunakan) — kandidat hapus
│   │   ├── ProductCard.jsx
│   │   └── StockBadge.jsx
│   └── data/
│       ├── products.js          ← PRODUCTS array + helpers + createEmptyProduct
│       └── config.js            ← DEFAULT_CURRENCIES, DEFAULT_KURS, FLAG_MAP, helpers
├── .env                         ← EXPO_PUBLIC_ABLY_KEY (di-gitignore)
├── app.json
├── tsconfig.json
└── package.json
```

---

## app.json — Konfigurasi Kritis

```json
{
  "expo": {
    "name": "stock-app",
    "slug": "stock-app",
    "scheme": "stock-app",
    "version": "1.0.0",
    "platforms": ["android"],
    "orientation": "portrait",
    "newArchEnabled": true,
    "android": {
      "softInputMode": "adjustNothing",
      "edgeToEdgeEnabled": true,
      "permissions": [
        "android.permission.POST_NOTIFICATIONS",
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.VIBRATE"
      ]
    },
    "plugins": ["expo-router", ["expo-notifications", { ... }]]
  }
}
```

**`softInputMode: "adjustNothing"` adalah keputusan arsitektur kritis.**
Tanpa ini, keyboard Android akan meresize/pan seluruh layout termasuk header.
Dengan `adjustNothing`, layout tidak disentuh OS — keyboard ditangani manual via `Keyboard.addListener` di `ProductsScreen`.

**Jangan tambahkan `softwareKeyboardLayoutMode`** — akan konflik dan override `softInputMode`.

---

## Arsitektur Navigasi — Custom Navigator (Hide/Show)

### Kenapa bukan Tab/Stack Navigator

Tab Navigator tidak support back button semantics yang diinginkan.
Stack Navigator menyebabkan lag karena mount + animasi saat pertama navigate.

### Cara Kerja

```
app/index.jsx → RootScreen
                  ├── Header terpusat (home icon / back arrow / dropdown menu)
                  ├── DashboardScreen  ← display:none jika tidak aktif
                  ├── ProductsScreen   ← display:none jika tidak aktif
                  ├── LogsScreen       ← display:none jika tidak aktif
                  └── ConfigScreen     ← display:none jika tidak aktif
```

Semua screen di-mount saat launch. Perpindahan hanya toggle `display:'none'` + `pointerEvents`. Zero lag, identik dengan cara kerja internal Tab Navigator.

### State Navigasi di RootScreen

```js
const [active, setActive]               = useState('dashboard');
const [previousScreen, setPreviousScreen] = useState('dashboard');
```

`navigate(to)` — fungsi terpusat, selalu catat `previousScreen`.
`handleBack()` — kembali ke `previousScreen`, bukan selalu dashboard.

### Tabel Back Kontekstual

| Dari | Navigasi ke | Tekan Back |
|---|---|---|
| Dashboard | — | Konfirmasi keluar |
| Dashboard | Products (tombol) | → Dashboard |
| Dashboard | Logs (dropdown menu) | → Dashboard |
| Dashboard | Config (dropdown menu) | → Dashboard |
| Products | Logs (dropdown menu) | → Products |
| Products | Config (dropdown menu) | → Products |

### Hardware Back Button

Priority: tutup dropdown menu → back ke previousScreen → konfirmasi keluar app.

---

## Dropdown Menu Header

- Icon: `ellipsis-vertical` (tiga titik vertikal, standar Android)
- Posisi: diukur via `menuBtnRef.current.measure()` — presisi, tidak statis
- `bottom: pageY + height - 20` (nilai yang sudah dikalibrasi user)
- Animasi: `Animated.parallel` fade + translateY 120ms, `useNativeDriver: true`

### Menu Per Screen (Kontekstual)

| Screen | Menu Items |
|---|---|
| Dashboard | Log, Konfigurasi, Refresh |
| Products | Log, Konfigurasi, Refresh |
| Logs | Refresh |
| Config | Refresh |

---

## Schema Data Produk (`src/data/products.js`)

```js
{
  id: string,
  name: string,
  sku: string,
  category: string,
  unit: string,              // 'karung', 'botol', 'bungkus', 'kotak', 'pcs', dll
  harga_modal_rp: number,
  harga_modal_non_rp: number | null,
  mata_uang_non_rp: string | null,   // kode ISO 4217: 'JPY', 'USD', 'CNY', dll
  harga_jual: number,
  stock_minimal: number,
  stock: number,
  sum_in: number,            // total unit masuk (akumulasi)
  count_in: number,          // jumlah transaksi masuk
  sum_out: number,           // total unit keluar (akumulasi)
  count_out: number,         // jumlah transaksi keluar
}
```

**Helpers yang tersedia:**
- `getStockStatus(product)` → `'aman' | 'menipis' | 'habis'`
- `formatRp(amount)` → `'Rp 68.000'`
- `createEmptyProduct(overrides)` → objek produk baru dengan schema lengkap

**7 produk dummy:** BRS-001, MNY-001, GLA-001, SBN-001, DTJ-001, TEH-001, KPI-001
Semua memiliki dummy data realistis untuk sum_in, count_in, sum_out, count_out.

---

## Schema Konfigurasi (`src/data/config.js`)

```js
DEFAULT_CURRENCIES  // Array: { code, name, symbol }
DEFAULT_KURS        // Object: { USD: 16285, CNY: 2185.5, JPY: 110.23, ... }
FLAG_MAP            // Object: { USD: '🇺🇸', JPY: '🇯🇵', CNY: '🇨🇳', ... }

// Helpers:
toIDR(amount, currencyCode, kurs)
getCurrencySymbol(currencyCode, currencies)
formatForeign(amount, currencyCode, currencies)
formatRp(amount)
```

`FLAG_MAP` ada di `config.js` — satu tempat untuk semua representasi visual mata uang.
Untuk tambah/hapus mata uang: edit `FLAG_MAP` + `DEFAULT_CURRENCIES` + `DEFAULT_KURS` di `config.js`.

---

## ProductsScreen — Arsitektur Detail

### Layout Card (3 baris kiri + tombol kanan)

```
┌──────────────────────────────────────────┬──────┐
│ BRS-001  (Sembako)  42 karung        ✓   │  ➕  │
│ Beras Premium 5kg                        │ ─── │
│ 🇯🇵 453  Rp 68.000  Rp 78.000  ↑120(8) ↓78(21)│  ➖  │
└──────────────────────────────────────────┴──────┘
```

**Baris 1:** SKU | (kategori) | qty (stock + satuan) | StatusIcon
**Baris 2:** Nama produk (focal point, font bold, berdiri sendiri)
**Baris 3:** Flag+harga_non_rp | harga_modal | harga_jual | in/out summary

**Kolom kanan:** tombol `+` (hijau `#F0FDF4`) dan `-` (merah `#FFF5F5`), icon size 32, container W_BTN = 36px

### Konstanta Lebar Kolom

```js
const W_SKU      = 50;
const W_CAT      = 60;
const W_PRICE_NR = 50;
const W_PRICE_RP = 60;
const W_PRICE_JL = 50;
const W_BTN      = 36;
const SEARCH_H   = 52;
```

### In/Out Summary (Baris 3 kanan)

```
↑ 120 (8)  ↓ 78 (21)
```
- `↑` = `arrow-up-circle` hijau `#16A34A`
- `↓` = `arrow-down-circle` merah `#DC2626`
- Format: `sum_in (count_in)` dan `sum_out (count_out)`
- Tidak ada label teks — hemat ruang

### Search Bar Bottom

```js
const SEARCH_H = 52;  // tinggi statis

// Mekanisme keyboard:
const [kbHeight, setKbHeight] = useState(0);
Keyboard.addListener('keyboardDidShow', e => setKbHeight(e.endCoordinates.height));
Keyboard.addListener('keyboardDidHide', () => setKbHeight(0));

// List area menyempit dari bawah:
<View style={{ flex: 1, marginBottom: SEARCH_H + kbHeight }}>
  <FlatList ... />
</View>

// Search bar absolute, naik tepat setinggi keyboard:
<View style={[styles.searchBar, { bottom: kbHeight }]}>
```

**Mengapa `adjustNothing` + manual listener:** `adjustResize` default meresize seluruh layout termasuk header. `adjustNothing` + listener memberikan kontrol presisi — hanya area list yang menyempit, header tidak bergerak.

### Tombol Tambah di Search Bar

Tombol `+` di ujung kanan search bar (width 36, dibatasi `searchDivider`).
Saat ini: `Alert.alert('Hallo aku tombol plus')` — placeholder untuk form tambah produk.

---

## Color System

| Warna | Hex | Penggunaan |
|---|---|---|
| Hijau primary | `#16A34A` | Status aman, harga jual, tombol +, in summary |
| Kuning warning | `#D97706` | Status menipis |
| Merah danger | `#DC2626` | Status habis, tombol -, out summary |
| Hijau bg | `#F0FDF4` | Background tombol + |
| Merah bg | `#FFF5F5` | Background tombol - |
| Teks utama | `#111` | Nama produk |
| Teks sekunder | `#333`, `#555`, `#666` | Harga, SKU, kategori |
| Teks disabled | `#BBB`, `#AAA` | Tombol disabled, count in/out |
| Border | `StyleSheet.hairlineWidth` + `#ECECEC` / `#CCCCCC` | Divider, hairline |
| Background app | `#F5F5F5` | Root background |
| Background card | `#FFFFFF` | Card, header, search bar |

---

## Known Limitations & Orphan Files

### Orphan files (kandidat hapus di iterasi berikutnya)
- `app/config.jsx`, `app/logs.jsx`, `app/products.jsx` — route lama, tidak diakses
- `src/components/ProductCard.jsx`, `src/components/StockBadge.jsx` — tidak digunakan

### Belum diimplementasi
| Feature | Status |
|---|---|
| Shared state antar screen | ❌ — Dashboard & Products baca PRODUCTS terpisah |
| Persistence (AsyncStorage) | ❌ — state reset saat restart |
| LogsScreen fungsional | ❌ — scaffold kosong |
| Form tambah produk | ❌ — tombol + sudah ada, aksi placeholder |
| Form edit produk | ❌ |
| Hapus produk | ❌ |
| Ably terhubung ke state | ❌ — koneksi aktif, publish/subscribe belum |
| `activeCode` ConfigScreen → ProductsScreen | ❌ — belum ada mekanisme share |
| Dropdown Refresh | ❌ — placeholder |

---

## Rencana 02d

1. **Context (shared state)** — `ProductsContext` untuk state produk agar Dashboard reaktif
2. **Form tambah produk** — bottom sheet modal dengan schema lengkap
3. **Form edit produk** — tap card membuka form edit
4. **Hapus produk** — long press dengan konfirmasi
5. **LogsScreen** — catat setiap stock in/out dengan timestamp
6. **AsyncStorage** — persist produk, stok, kurs
7. **Bersihkan orphan files**
8. **Ably → state** — publish stock in/out, subscribe update realtime

---

## Cara Menjalankan

```bash
npx expo start --clear
```

Scan QR dengan Expo Go di Android. Cold start wajib setelah ubah `app.json`.

---

## Aturan Yang Tidak Boleh Dilanggar

- Jangan gunakan `router.push()` untuk navigasi antar screen utama — gunakan `navigate()` di RootScreen
- Jangan tambahkan `softwareKeyboardLayoutMode` di app.json — konflik dengan `adjustNothing`
- Jangan gunakan `KeyboardAvoidingView` — tidak reliable di setup ini
- Jangan gunakan Tab Navigator atau Stack Navigator untuk navigasi utama
- Jangan gunakan library eksternal untuk flag emoji — Unicode regional indicator sudah cukup
- Jangan gunakan Redux/Zustand — belum diperlukan, Context sudah cukup
- Jangan gunakan `opacity: 0` untuk hide screen — gunakan `display: 'none'` + `pointerEvents`
- Semua navigasi harus melalui fungsi `navigate()` di RootScreen agar `previousScreen` tercatat