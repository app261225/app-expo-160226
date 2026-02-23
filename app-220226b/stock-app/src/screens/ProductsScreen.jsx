import { useState, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRODUCTS, getStockStatus, formatRp } from '../data/products';
import { useNotify } from '../notifications/useNotify';

// ─── Konstanta ────────────────────────────────────────────────────────────────

const FLAG_MAP = {
  USD: '🇺🇸', JPY: '🇯🇵', CNY: '🇨🇳', SGD: '🇸🇬',
  AUD: '🇦🇺', EUR: '🇪🇺', GBP: '🇬🇧', MYR: '🇲🇾',
  THB: '🇹🇭', HKD: '🇭🇰',
};

const STATUS_COLOR = {
  aman:    { bg: '#E9F7EF', text: '#1E8449' },
  menipis: { bg: '#FEF9E7', text: '#B7770D' },
  habis:   { bg: '#FDEDEC', text: '#C0392B' },
};

const STATUS_LABEL = {
  aman: 'Aman', menipis: 'Menipis', habis: 'Habis',
};

// ─── Sub-komponen ─────────────────────────────────────────────────────────────

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

const ProductCard = memo(function ProductCard({ product, onStockIn, onStockOut }) {
  const status = getStockStatus(product);

  return (
    <View style={styles.card}>

      {/* Baris 1: SKU + Badge */}
      <View style={styles.cardHeader}>
        <Text style={styles.sku}>{product.sku}</Text>
        <StatusBadge status={status} />
      </View>

      {/* Baris 2: Nama produk */}
      <Text style={styles.productName}>{product.name}</Text>

      {/* Baris 3: Harga modal + jual inline */}
      <View style={styles.priceRow}>
        {/* Modal */}
        <View style={styles.priceInline}>
          <Ionicons name="calculator-outline" size={12} color="#AAA" />
          <Text style={styles.priceInlineValue}>{formatRp(product.harga_modal_rp)}</Text>
          {product.harga_modal_non_rp !== null && (
            <Text style={styles.priceFlag}>
              {FLAG_MAP[product.mata_uang_non_rp] ?? product.mata_uang_non_rp}
              {' '}{product.harga_modal_non_rp.toLocaleString('id-ID')}
            </Text>
          )}
        </View>

        <Text style={styles.priceSep}>·</Text>

        {/* Jual */}
        <View style={styles.priceInline}>
          <Ionicons name="storefront-outline" size={12} color="#1E8449" />
          <Text style={[styles.priceInlineValue, styles.priceJual]}>
            {formatRp(product.harga_jual)}
          </Text>
        </View>
      </View>

      {/* Baris 4: Stok minimal + kontrol stok */}
      <View style={styles.stockRow}>
        <Text style={styles.stockMinimal}>
          min {product.stock_minimal} {product.unit}
        </Text>
        <View style={styles.stockActions}>
          <TouchableOpacity
            style={[styles.stockBtn, styles.stockBtnOut, product.stock === 0 && styles.stockBtnDisabled]}
            onPress={() => onStockOut(product)}
            disabled={product.stock === 0}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={13} color={product.stock === 0 ? '#CCC' : '#C0392B'} />
          </TouchableOpacity>

          <Text style={styles.stockValue}>
            {product.stock}{' '}
            <Text style={styles.stockUnit}>{product.unit}</Text>
          </Text>

          <TouchableOpacity
            style={[styles.stockBtn, styles.stockBtnIn]}
            onPress={() => onStockIn(product)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={13} color="#1E8449" />
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
});

// ─── Screen utama ─────────────────────────────────────────────────────────────

export default function ProductsScreen() {
  const [products, setProducts] = useState(PRODUCTS);
  const { notify }              = useNotify();

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

  return (
    <FlatList
      data={products}
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
      initialNumToRender={7}
      maxToRenderPerBatch={7}
      windowSize={5}
      removeClippedSubviews={true}
      ListEmptyComponent={
        <View style={styles.emptyWrapper}>
          <Ionicons name="cube-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>Tidak ada produk.</Text>
        </View>
      }
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  list: {
    padding: 12,
    gap: 8,
  },

  // ── Card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 1,
    gap: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sku: {
    fontSize: 10,
    color: '#AAA',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },

  // ── Badge
  badge: {
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // ── Harga inline
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceInlineValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  priceJual: {
    color: '#1E8449',
  },
  priceFlag: {
    fontSize: 11,
    color: '#AAA',
    marginLeft: 2,
  },
  priceSep: {
    fontSize: 12,
    color: '#CCC',
  },

  // ── Stok
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  stockMinimal: {
    fontSize: 11,
    color: '#BBB',
  },
  stockActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
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
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
    minWidth: 36,
    textAlign: 'center',
  },
  stockUnit: {
    fontSize: 10,
    fontWeight: '400',
    color: '#888',
  },

  // ── Empty
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