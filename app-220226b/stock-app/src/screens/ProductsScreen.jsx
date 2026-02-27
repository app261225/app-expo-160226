import { useState, useMemo, useEffect, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRODUCTS, getStockStatus, formatRp } from '../data/products';
import { FLAG_MAP } from '../data/config';

// ─── Konstanta ────────────────────────────────────────────────────────────────

const W_SKU      = 50;
const W_CAT      = 60;
const W_PRICE_NR = 50;
const W_PRICE_RP = 60;
const W_PRICE_JL = 50;
const W_BTN      = 36;
const W_IN       = 50;
const W_OUT      = 50;
const SEARCH_H   = 52;

const STATUS_CONFIG = {
  aman:    { icon: 'checkmark-circle', color: '#16A34A', bg: '#DCFCE7', text: '#16A34A' },
  menipis: { icon: 'warning',          color: '#D97706', bg: '#FEF3C7', text: '#D97706' },
  habis:   { icon: 'alert-circle',     color: '#DC2626', bg: '#FEE2E2', text: '#DC2626' },
};

// ─── ProductCard ──────────────────────────────────────────────────────────────

const ProductCard = memo(function ProductCard({ product }) {
  const status = getStockStatus(product);
  const cfg    = STATUS_CONFIG[status];

  // + : disabled jika product.disabled === true
  // - : disabled jika product.disabled === true ATAU stock === 0
  const disabledIn  = product.disabled;
  const disabledOut = product.disabled || product.stock === 0;

  return (
    <View style={[styles.card, product.disabled && styles.cardDisabled]}>
      <View style={styles.cardLeft}>

        {/* Baris 1: [icon status] SKU (kategori) [qtyBundle: angka kiri | unit kanan] ── [in summary] */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name={cfg.icon} size={14} color={cfg.color} />
            <Text style={styles.sku}      numberOfLines={1}>{product.sku}</Text>
            <Text style={styles.category} numberOfLines={1}>({product.category})</Text>

            {/* Wadah qty: sisa lebar baris 1 setelah icon+SKU+kategori+summaryIn */}
            <View style={styles.qtyBundle}>
              {/* Kiri: angka stock dan stock_minimal, rata kiri */}
              <View style={styles.qtyLeft}>
                <View style={[styles.stockBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={[styles.stockBadgeText, { color: cfg.text }]}>{product.stock}</Text>
                </View>
                <Text style={styles.qtySep}>/</Text>
                <View style={styles.stockMinBadge}>
                  <Text style={styles.stockMinText}>{product.stock_minimal}</Text>
                </View>
              </View>
              {/* Kanan: satuan/unit, rata kanan */}
              <Text style={styles.unit} numberOfLines={1}>{product.unit}</Text>
            </View>
          </View>
          {/* In summary — kolom tetap, konten rata kiri */}
          <View style={styles.summaryIn}>
            <Ionicons name="arrow-down-circle" size={12} color="#16A34A" />
            <Text style={styles.inOutIn}>{product.sum_in}</Text>
            <Text style={styles.inOutCount}>({product.count_in})</Text>
          </View>
        </View>

        {/* Baris 2: Nama produk */}
        <Text style={[styles.name, product.disabled && styles.nameDisabled]} numberOfLines={1}>
          {product.name}{product.disabled ? '  ·  nonaktif' : ''}
        </Text>

        {/* Baris 3: Harga ──── out summary rata kanan */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            {product.harga_modal_non_rp !== null ? (
              <Text style={styles.priceNonRp} numberOfLines={1}>
                {FLAG_MAP[product.mata_uang_non_rp] ?? product.mata_uang_non_rp}
                {' '}{product.harga_modal_non_rp.toLocaleString('id-ID')}
              </Text>
            ) : (
              <View style={{ width: W_PRICE_NR }} />
            )}
            <Text style={styles.priceModal} numberOfLines={1}>{formatRp(product.harga_modal_rp)}</Text>
            <Text style={styles.priceJual}  numberOfLines={1}>{formatRp(product.harga_jual)}</Text>
          </View>
          {/* Out summary — kolom tetap, konten rata kiri */}
          <View style={styles.summaryOut}>
            <Ionicons name="arrow-up-circle" size={12} color="#DC2626" />
            <Text style={styles.inOutOut}>{product.sum_out}</Text>
            <Text style={styles.inOutCount}>({product.count_out})</Text>
          </View>
        </View>

      </View>

      {/* Tombol +/- — pure display, logika disabled */}
      <View style={styles.cardRight}>
        <TouchableOpacity
          style={[styles.stockBtn, styles.stockBtnIn, disabledIn && styles.stockBtnDisabled]}
          disabled={disabledIn}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={32} color={disabledIn ? '#BBBBBB' : '#16A34A'} />
        </TouchableOpacity>
        <View style={styles.btnDivider} />
        <TouchableOpacity
          style={[styles.stockBtn, styles.stockBtnOut, disabledOut && styles.stockBtnDisabled]}
          disabled={disabledOut}
          activeOpacity={0.7}
        >
          <Ionicons name="remove-circle" size={32} color={disabledOut ? '#BBBBBB' : '#DC2626'} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProductsScreen() {
  const [search, setSearch]     = useState('');
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      setKbHeight(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKbHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const filtered = useMemo(() => {
    // Sembunyikan produk yang deleted_at tidak null
    const active = PRODUCTS.filter(p => p.deleted_at === null);
    const q = search.toLowerCase().trim();
    if (!q) return active;
    return active.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)  ||
      p.category.toLowerCase().includes(q)
    );
  }, [search]);

  const listAreaStyle  = { flex: 1, marginBottom: SEARCH_H + kbHeight };
  const searchBarStyle = [styles.searchBar, { bottom: kbHeight }];

  return (
    <View style={styles.container}>

      <View style={listAreaStyle}>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          initialNumToRender={7}
          maxToRenderPerBatch={7}
          windowSize={5}
          removeClippedSubviews={true}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyWrapper}>
              <Ionicons name="cube-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>Tidak ada produk.</Text>
            </View>
          }
        />
      </View>

      <View style={searchBarStyle}>
        <Ionicons name="search-outline" size={16} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama, SKU, atau kategori..."
          placeholderTextColor="#BBB"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearch('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={16} color="#BBB" />
          </TouchableOpacity>
        )}
        <View style={styles.searchDivider} />
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => Alert.alert('Hallo aku tombol plus')}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={22} color="#16A34A" />
        </TouchableOpacity>
      </View>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    padding: 8,
    gap: 5,
    paddingBottom: 12,
  },

  // ── Search bar
  searchBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SEARCH_H,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#CCCCCC',
    paddingHorizontal: 14,
    gap: 10,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    height: SEARCH_H,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  searchDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: '#CCCCCC',
    marginHorizontal: 4,
  },
  addBtn: {
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 1,
  },
  cardDisabled: {
    opacity: 0.55,
  },
  cardLeft: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 4,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },

  // ── Wadah qty: mengisi sisa lebar baris 1, dibagi 60:40
  qtyBundle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Bagian kiri 60%: badge stock + sep + badge min — rata kiri
  qtyLeft: {
    flex: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingRight: 6,
  },


  // ── Baris 1 kiri
  sku: {
    width: W_SKU,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
  },
  category: {
    width: W_CAT,
    fontSize: 12,
    color: '#666',
  },
  stockBadge: {
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  stockBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  qtySep: {
    fontSize: 12,
    color: '#BBB',
  },
  stockMinBadge: {
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    backgroundColor: '#F0F0F0',
  },
  stockMinText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
  },
  unit: {
    flex: 4,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    paddingRight: 6,
  },

  // ── Summary (in/out) — kolom tetap, konten rata kiri
  summaryIn: {
    width: W_IN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 2,
    flexShrink: 0,
  },
  summaryOut: {
    width: W_OUT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 2,
    flexShrink: 0,
  },
  inOutIn: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  inOutOut: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  inOutCount: {
    fontSize: 10,
    color: '#AAA',
  },

  // ── Baris 2
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
  },
  nameDisabled: {
    color: '#999',
  },

  // ── Baris 3 kiri
  priceNonRp: {
    width: W_PRICE_NR,
    fontSize: 12,
    color: '#555',
  },
  priceModal: {
    width: W_PRICE_RP,
    fontSize: 12,
    color: '#555',
  },
  priceJual: {
    width: W_PRICE_JL,
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },

  // ── Kanan
  cardRight: {
    width: W_BTN,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: '#ECECEC',
    flexDirection: 'column',
  },
  stockBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  stockBtnIn:       { backgroundColor: '#F0FDF4' },
  stockBtnOut:      { backgroundColor: '#FFF5F5' },
  stockBtnDisabled: { backgroundColor: '#F5F5F5' },
  btnDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#ECECEC',
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