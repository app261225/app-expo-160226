// ─── src/data/products.js ─────────────────────────────────────────────────────
// Schema per produk:
// id, name, sku, category, unit
// harga_modal_rp       — harga modal dalam Rupiah
// harga_modal_non_rp   — harga modal dalam mata uang asing (nullable)
// mata_uang_non_rp     — kode mata uang asing, misal 'USD', 'CNY', 'JPY' (nullable)
// harga_jual           — harga jual dalam Rupiah
// stock_minimal        — threshold stok menipis
// stock                — stok saat ini
// sum_in               — total unit masuk (akumulasi stock in)
// count_in             — jumlah transaksi stock in
// sum_out              — total unit keluar (akumulasi stock out)
// count_out            — jumlah transaksi stock out
// disabled             — true: tombol +/- disabled (produk nonaktif sementara)
// deleted_at           — null: aktif | string ISO: produk dihapus, tidak muncul di list
//
// Kurs referensi: 1 JPY = 150 IDR
// Nilai JPY dibulatkan ke bilangan bulat (JPY tidak menggunakan desimal)
// ─────────────────────────────────────────────────────────────────────────────

export const PRODUCTS = [
  {
    id: '1',
    name: 'Beras Premium 5kg',
    sku: 'BRS-001',
    category: 'Sembako',
    unit: 'karung',
    harga_modal_rp: 68000,
    harga_modal_non_rp: 453,
    mata_uang_non_rp: 'JPY',
    harga_jual: 78000,
    stock_minimal: 10,
    stock: 42,
    sum_in: 120,
    count_in: 8,
    sum_out: 78,
    count_out: 21,
    disabled: false,
    deleted_at: null,
  },
  {
    id: '2',
    name: 'Minyak Goreng 2L',
    sku: 'MNY-001',
    category: 'Sembako',
    unit: 'botol',
    harga_modal_rp: 28500,
    harga_modal_non_rp: 190,
    mata_uang_non_rp: 'JPY',
    harga_jual: 34000,
    stock_minimal: 12,
    stock: 18,
    sum_in: 60,
    count_in: 5,
    sum_out: 42,
    count_out: 14,
    disabled: false,
    deleted_at: null,
  },
  {
    id: '3',
    name: 'Gula Pasir 1kg',
    sku: 'GLA-001',
    category: 'Sembako',
    unit: 'bungkus',
    harga_modal_rp: 14000,
    harga_modal_non_rp: 93,
    mata_uang_non_rp: 'JPY',
    harga_jual: 17000,
    stock_minimal: 8,
    stock: 5,
    sum_in: 40,
    count_in: 4,
    sum_out: 35,
    count_out: 18,
    disabled: false,
    deleted_at: null,
  },
  {
    id: '4',
    name: 'Sabun Cuci Piring',
    sku: 'SBN-001',
    category: 'Kebersihan',
    unit: 'botol',
    harga_modal_rp: 9500,
    harga_modal_non_rp: 63,
    mata_uang_non_rp: 'JPY',
    harga_jual: 13000,
    stock_minimal: 6,
    stock: 0,
    sum_in: 24,
    count_in: 3,
    sum_out: 24,
    count_out: 11,
    disabled: false,        // stock 0 → tombol - disabled by logic, bukan disabled field
    deleted_at: null,
  },
  {
    id: '5',
    name: 'Deterjen Bubuk 1kg',
    sku: 'DTJ-001',
    category: 'Kebersihan',
    unit: 'bungkus',
    harga_modal_rp: 19000,
    harga_modal_non_rp: 127,
    mata_uang_non_rp: 'JPY',
    harga_jual: 24000,
    stock_minimal: 10,
    stock: 23,
    sum_in: 48,
    count_in: 4,
    sum_out: 25,
    count_out: 9,
    disabled: true,         // DEMO: produk nonaktif — kedua tombol disabled
    deleted_at: null,
  },
  {
    id: '6',
    name: 'Teh Celup Import',
    sku: 'TEH-001',
    category: 'Minuman',
    unit: 'kotak',
    harga_modal_rp: 32000,
    harga_modal_non_rp: 2.1,
    mata_uang_non_rp: 'USD',
    harga_jual: 42000,
    stock_minimal: 5,
    stock: 8,
    sum_in: 20,
    count_in: 3,
    sum_out: 12,
    count_out: 6,
    disabled: false,
    deleted_at: '2025-01-15T08:30:00.000Z', // DEMO: produk dihapus — tidak muncul di list
  },
  {
    id: '7',
    name: 'Kopi Bubuk Vietnam',
    sku: 'KPI-001',
    category: 'Minuman',
    unit: 'bungkus',
    harga_modal_rp: 45000,
    harga_modal_non_rp: 18.5,
    mata_uang_non_rp: 'CNY',
    harga_jual: 58000,
    stock_minimal: 5,
    stock: 3,
    sum_in: 15,
    count_in: 2,
    sum_out: 12,
    count_out: 7,
    disabled: false,
    deleted_at: null,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Tentukan status stok berdasarkan stock dan stock_minimal */
export function getStockStatus(product) {
  if (product.stock === 0) return 'habis';
  if (product.stock <= product.stock_minimal) return 'menipis';
  return 'aman';
}

/** Format angka ke Rupiah tanpa library eksternal */
export function formatRp(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

/** Factory function — buat produk baru dengan default schema lengkap */
export function createEmptyProduct(overrides = {}) {
  return {
    id: Date.now().toString(),
    name: '',
    sku: '',
    category: '',
    unit: '',
    harga_modal_rp: 0,
    harga_modal_non_rp: null,
    mata_uang_non_rp: null,
    harga_jual: 0,
    stock_minimal: 0,
    stock: 0,
    sum_in: 0,
    count_in: 0,
    sum_out: 0,
    count_out: 0,
    disabled: false,
    deleted_at: null,
    ...overrides,
  };
}