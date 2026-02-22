import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRODUCTS, getStockStatus, formatRp } from '../data/products';
import { useNotify } from '../notifications/useNotify';

// ─── Konstanta ────────────────────────────────────────────────────────────────

const FILTERS = [
  { key: 'semua',   label: 'Semua'   },
  { key: 'aman',    label: 'Aman'    },
  { key: 'menipis', label: 'Menipis' },
  { key: 'habis',   label: 'Habis'   },
];

const STATUS_COLOR = {
  aman:    { bg: '#E9F7EF', text: '#1E8449' },
  menipis: { bg: '#FEF9E7', text: '#B7770D' },
  habis:   { bg: '#FDEDEC', text: '#C0392B' },
};

const STATUS_LABEL = {
  aman:    'Aman',
  menipis: 'Menipis',
  habis:   'Habis',
};

// ─── Sub-komponen ─────────────────────────────────────────────────────────────

function SearchBar({ value, onChangeText }) {
  return (
    <View style={styles.searchWrapper}>
      <Ionicons name="search-outline" size={16} color="#888" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Cari nama produk atau SKU..."
        placeholderTextColor="#AAA"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={16} color="#AAA" />
        </TouchableOpacity>
      )}
    </View>
  );
}

function FilterBar({ active, onSelect }) {
  return (
    <View style={styles.filterRow}>
      {FILTERS.map(f => (
        <TouchableOpacity
          key={f.key}
          style={[styles.filterBtn, active === f.key && styles.filterBtnActive]}
          onPress={() => onSelect(f.key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterLabel, active === f.key && styles.filterLabelActive]}>
            {f.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function StatusBadge({ status }) {
  const color = STATUS_COLOR[status];
  return (
    <View style={[styles.badge, { backgroundColor: color.bg }]}>
      <Text style={[styles.badgeText, { color: color.text }]}>
        {STATUS_LABEL[status]}
      </Text>
    </View>
  );
}

function ProductCard({ product, onStockIn, onStockOut }) {
  const status = getStockStatus(product);

  return (
    <View style={styles.card}>
      {/* Header: SKU + Status */}
      <View style={styles.cardHeader}>
        <Text style={styles.sku}>{product.sku}</Text>
        <StatusBadge status={status} />
      </View>

      {/* Nama & Kategori */}
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.category}>{product.category}</Text>

      <View style={styles.divider} />

      {/* Harga */}
      <View style={styles.priceRow}>
        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>Modal</Text>
          <Text style={styles.priceValue}>{formatRp(product.harga_modal_rp)}</Text>
          {product.harga_modal_non_rp !== null && (
            <Text style={styles.priceNonRp}>
              {product.mata_uang_non_rp} {product.harga_modal_non_rp.toLocaleString('id-ID')}
            </Text>
          )}
        </View>
        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>Jual</Text>
          <Text style={[styles.priceValue, styles.priceJual]}>
            {formatRp(product.harga_jual)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Stok */}
      <View style={styles.stockRow}>
        <View>
          <Text style={styles.stockLabel}>Stok Minimal</Text>
          <Text style={styles.stockMinimal}>
            {product.stock_minimal} {product.unit}
          </Text>
        </View>
        <View style={styles.stockActions}>
          <TouchableOpacity
            style={[styles.stockBtn, styles.stockBtnOut, product.stock === 0 && styles.stockBtnDisabled]}
            onPress={() => onStockOut(product)}
            disabled={product.stock === 0}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={14} color={product.stock === 0 ? '#CCC' : '#C0392B'} />
          </TouchableOpacity>

          <Text style={styles.stockValue}>
            {product.stock} <Text style={styles.stockUnit}>{product.unit}</Text>
          </Text>

          <TouchableOpacity
            style={[styles.stockBtn, styles.stockBtnIn]}
            onPress={() => onStockIn(product)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={14} color="#1E8449" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Screen utama ─────────────────────────────────────────────────────────────

export default function ProductsScreen() {
  const [products, setProducts]   = useState(PRODUCTS);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('semua');
  const { notify }                = useNotify();

  // Derived list — dihitung ulang hanya saat search/filter/products berubah
  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter(p => {
      const matchSearch =
        q === '' ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);

      const matchFilter =
        filter === 'semua' || getStockStatus(p) === filter;

      return matchSearch && matchFilter;
    });
  }, [products, search, filter]);

  const handleStockIn = useCallback((product) => {
    setProducts(prev =>
      prev.map(p => p.id === product.id ? { ...p, stock: p.stock + 1 } : p)
    );
    notify({
      title: '📦 Stock In',
      body: `${product.name} +1 ${product.unit}`,
    });
  }, [notify]);

  const handleStockOut = useCallback((product) => {
    if (product.stock === 0) return;
    setProducts(prev =>
      prev.map(p => p.id === product.id ? { ...p, stock: p.stock - 1 } : p)
    );
    notify({
      title: '📤 Stock Out',
      body: `${product.name} -1 ${product.unit}`,
    });
  }, [notify]);

  const handleTambah = useCallback(() => {
    // Placeholder — akan diisi form tambah produk di iterasi berikutnya
    Alert.alert('Tambah Produk', 'Fitur form tambah produk belum tersedia.');
  }, []);

  return (
    <View style={styles.container}>

      {/* Search */}
      <View style={styles.topSection}>
        <SearchBar value={search} onChangeText={setSearch} />

        {/* Filter */}
        <FilterBar active={filter} onSelect={setFilter} />

        {/* Counter + Tombol Tambah */}
        <View style={styles.infoRow}>
          <Text style={styles.countText}>
            {filteredProducts.length} produk ditampilkan
          </Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleTambah}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={16} color="#FFF" />
            <Text style={styles.addBtnText}>Tambah</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onStockIn={handleStockIn}
            onStockOut={handleStockOut}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrapper}>
            <Ionicons name="cube-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>Tidak ada produk ditemukan.</Text>
          </View>
        }
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // ── Top section
  topSection: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111',
    padding: 0,
  },

  // ── Filter
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  filterBtnActive: {
    backgroundColor: '#1E8449',
  },
  filterLabel: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  filterLabelActive: {
    color: '#FFF',
  },

  // ── Info row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  countText: {
    fontSize: 12,
    color: '#888',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E8449',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // ── List
  list: {
    padding: 16,
    gap: 12,
  },

  // ── Card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sku: {
    fontSize: 11,
    color: '#888',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },

  // ── Badge
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Harga
  priceRow: {
    flexDirection: 'row',
    gap: 24,
  },
  priceBlock: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: '#AAA',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  priceJual: {
    color: '#1E8449',
  },
  priceNonRp: {
    fontSize: 11,
    color: '#AAA',
    marginTop: 1,
  },

  // ── Stok
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: 11,
    color: '#AAA',
    marginBottom: 2,
  },
  stockMinimal: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  stockActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stockBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockBtnIn: {
    backgroundColor: '#E9F7EF',
  },
  stockBtnOut: {
    backgroundColor: '#FDEDEC',
  },
  stockBtnDisabled: {
    backgroundColor: '#F5F5F5',
  },
  stockValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    minWidth: 40,
    textAlign: 'center',
  },
  stockUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: '#888',
  },

  // ── Empty state
  emptyWrapper: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#AAA',
  },
});