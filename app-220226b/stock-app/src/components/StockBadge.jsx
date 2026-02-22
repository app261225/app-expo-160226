import { View, Text, StyleSheet } from 'react-native';

/**
 * Menampilkan badge stok dengan warna:
 * - Merah   : stok 0 (habis)
 * - Kuning  : stok 1–10 (menipis)
 * - Hijau   : stok >10 (aman)
 */
export default function StockBadge({ stock, unit }) {
  const status = stock === 0 ? 'empty' : stock <= 10 ? 'low' : 'ok';

  const colors = {
    empty: { bg: '#FDECEA', text: '#C0392B' },
    low:   { bg: '#FEF9E7', text: '#B7770D' },
    ok:    { bg: '#EAFAF1', text: '#1E8449' },
  };

  const labels = {
    empty: 'Habis',
    low:   'Menipis',
    ok:    'Tersedia',
  };

  return (
    <View style={[styles.badge, { backgroundColor: colors[status].bg }]}>
      <Text style={[styles.count, { color: colors[status].text }]}>
        {stock} {unit}
      </Text>
      <Text style={[styles.label, { color: colors[status].text }]}>
        {labels[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  count: {
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    marginTop: 1,
  },
});