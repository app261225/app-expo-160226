import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PRODUCTS } from '../data/products';

function SummaryCard({ label, value, color }) {
  return (
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const total = PRODUCTS.length;
  const empty = PRODUCTS.filter(p => p.stock === 0).length;
  const low   = PRODUCTS.filter(p => p.stock > 0 && p.stock <= 10).length;
  const ok    = PRODUCTS.filter(p => p.stock > 10).length;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          <SummaryCard label="Total Produk" value={total} color="#3498DB" />
          <SummaryCard label="Stok Aman"    value={ok}    color="#1E8449" />
          <SummaryCard label="Stok Menipis" value={low}   color="#B7770D" />
          <SummaryCard label="Stok Habis"   value={empty} color="#C0392B" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    borderLeftWidth: 4,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
});