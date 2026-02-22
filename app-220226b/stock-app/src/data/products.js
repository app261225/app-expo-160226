// Schema per produk:
// id, name, sku, category, unit
// harga_modal_rp       — harga modal dalam Rupiah
// harga_modal_non_rp   — harga modal dalam mata uang asing (nullable)
// mata_uang_non_rp     — kode mata uang asing, misal 'USD', 'CNY' (nullable)
// harga_jual           — harga jual dalam Rupiah
// stock_minimal        — threshold stok menipis
// stock                — stok saat ini

export const PRODUCTS = [
  {
    id: '1',
    name: 'Beras Premium 5kg',
    sku: 'BRS-001',
    category: 'Sembako',
    unit: 'karung',
    harga_modal_rp: 68000,
    harga_modal_non_rp: null,
    mata_uang_non_rp: null,
    harga_jual: 78000,
    stock_minimal: 10,
    stock: 42,
  },
  {
    id: '2',
    name: 'Minyak Goreng 2L',
    sku: 'MNY-001',
    category: 'Sembako',
    unit: 'botol',
    harga_modal_rp: 28500,
    harga_modal_non_rp: null,
    mata_uang_non_rp: null,
    harga_jual: 34000,
    stock_minimal: 12,
    stock: 18,
  },
  {
    id: '3',
    name: 'Gula Pasir 1kg',
    sku: 'GLA-001',
    category: 'Sembako',
    unit: 'bungkus',
    harga_modal_rp: 14000,
    harga_modal_non_rp: null,
    mata_uang_non_rp: null,
    harga_jual: 17000,
    stock_minimal: 8,
    stock: 5,
  },
  {
    id: '4',
    name: 'Sabun Cuci Piring',
    sku: 'SBN-001',
    category: 'Kebersihan',
    unit: 'botol',
    harga_modal_rp: 9500,
    harga_modal_non_rp: null,
    mata_uang_non_rp: null,
    harga_jual: 13000,
    stock_minimal: 6,
    stock: 0,
  },
  {
    id: '5',
    name: 'Deterjen Bubuk 1kg',
    sku: 'DTJ-001',
    category: 'Kebersihan',
    unit: 'bungkus',
    harga_modal_rp: 19000,
    harga_modal_non_rp: null,
    mata_uang_non_rp: null,
    harga_jual: 24000,
    stock_minimal: 10,
    stock: 23,
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
  },
];

// Helper: tentukan status stok berdasarkan stock dan stock_minimal
export function getStockStatus(product) {
  if (product.stock === 0) return 'habis';
  if (product.stock <= product.stock_minimal) return 'menipis';
  return 'aman';
}

// Helper: format angka ke Rupiah tanpa library eksternal
export function formatRp(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}