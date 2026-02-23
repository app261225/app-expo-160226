import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRODUCTS, getStockStatus } from '../data/products';

function SummaryCard({ label, value, color }) {
  return (
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function NavButton({ label, icon, onPress }) {
  return (
    <TouchableOpacity
      style={styles.navButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={28} color="#1E8449" />
      <Text style={styles.navLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function DashboardScreen({ onNavigate }) {
  const total   = PRODUCTS.length;
  const habis   = PRODUCTS.filter(p => getStockStatus(p) === 'habis').length;
  const menipis = PRODUCTS.filter(p => getStockStatus(p) === 'menipis').length;
  const aman    = PRODUCTS.filter(p => getStockStatus(p) === 'aman').length;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Ringkasan Stok</Text>
        <View style={styles.grid}>
          <SummaryCard label="Total Produk" value={total}   color="#3498DB" />
          <SummaryCard label="Stok Aman"    value={aman}    color="#1E8449" />
          <SummaryCard label="Stok Menipis" value={menipis} color="#B7770D" />
          <SummaryCard label="Stok Habis"   value={habis}   color="#C0392B" />
        </View>

        <Text style={styles.sectionTitle}>Menu</Text>
        <View style={styles.navGrid}>
          <NavButton
            label="Produk"
            icon="cube-outline"
            onPress={() => onNavigate('products')}
          />
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
    gap: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 4,
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
  navGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
    elevation: 2,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});