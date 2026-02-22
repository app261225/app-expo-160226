import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import StockBadge from './StockBadge';

export default function ProductCard({ product, onStockIn, onStockOut }) {
  return (
    <View style={styles.card}>
      {/* Header: nama + SKU */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.sku}>{product.sku} · {product.category}</Text>
        </View>
        <StockBadge stock={product.stock} unit={product.unit} />
      </View>

      {/* Tombol aksi */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnIn]}
          onPress={() => onStockIn(product)}
        >
          <Text style={styles.btnInText}>+ Stock In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnOut, product.stock === 0 && styles.btnDisabled]}
          onPress={() => onStockOut(product)}
          disabled={product.stock === 0}
        >
          <Text style={[styles.btnOutText, product.stock === 0 && styles.btnDisabledText]}>
            − Stock Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 3,
  },
  sku: {
    fontSize: 12,
    color: '#888',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnIn: {
    backgroundColor: '#1E8449',
  },
  btnInText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  btnOut: {
    backgroundColor: '#FDECEA',
  },
  btnOutText: {
    color: '#C0392B',
    fontWeight: '600',
    fontSize: 14,
  },
  btnDisabled: {
    backgroundColor: '#F0F0F0',
  },
  btnDisabledText: {
    color: '#AAAAAA',
  },
});