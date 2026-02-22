import { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard';
import { useNotify } from '../notifications/useNotify';

export default function ProductsScreen() {
  const [products, setProducts] = useState(PRODUCTS);
  const { notify } = useNotify();

  const handleStockIn = useCallback((product) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === product.id ? { ...p, stock: p.stock + 1 } : p
      )
    );
    notify({
      title: '📦 Stock In',
      body: `${product.name} bertambah 1 ${product.unit}`,
    });
  }, [notify]);

  const handleStockOut = useCallback((product) => {
    if (product.stock === 0) return;
    setProducts(prev =>
      prev.map(p =>
        p.id === product.id ? { ...p, stock: p.stock - 1 } : p
      )
    );
    notify({
      title: '📤 Stock Out',
      body: `${product.name} berkurang 1 ${product.unit}`,
    });
  }, [notify]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});