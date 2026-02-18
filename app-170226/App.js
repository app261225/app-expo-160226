import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { FlashList } from "@shopify/flash-list";

// Import database & logic
import { db } from './db/client';
import migrations from './drizzle/migrations';
import { InventoryDAO } from './db/dao/InventoryDAO';

export default function App() {
  // 1. Jalankan Migrasi Database
  const { success, error } = useMigrations(db, migrations);
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Fungsi Ambil Data
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await InventoryDAO.getProdukAktif();
      setItems(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) loadData();
  }, [success]);

  // Render jika terjadi error atau loading migrasi
  if (error) return <View style={styles.center}><Text>Error: {error.message}</Text></View>;
  if (!success) return <View style={styles.center}><ActivityIndicator size="large" /><Text>Inisialisasi DB...</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stok Epen 📦</Text>
        <TouchableOpacity onPress={loadData} style={styles.btnRefresh}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>REFRESH</Text>
        </TouchableOpacity>
      </View>

      <FlashList
        data={items}
        estimatedItemSize={80}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.empty}>Belum ada barang di gudang.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{flex: 1}}>
              <Text style={styles.sku}>{item.sku || 'TANPA SKU'}</Text>
              <Text style={styles.nama}>{item.nama}</Text>
              <Text style={styles.harga}>Jual: Rp {item.jual?.toLocaleString()}</Text>
            </View>
            <View style={styles.stockBox}>
              <Text style={[styles.stockText, item.stock <= item.stockMin && {color: 'red'}]}>
                {item.stock}
              </Text>
              <Text style={styles.unit}>Unit</Text>
            </View>
          </View>
        )}
      />
      
      {/* Tombol Tambah Barang Sederhana */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => alert('Buka Modal Tambah Barang')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingHorizontal: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#2D3436' },
  btnRefresh: { backgroundColor: '#0984E3', padding: 10, borderRadius: 8 },
  card: { 
    backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4
  },
  sku: { fontSize: 11, color: '#636E72', fontWeight: 'bold' },
  nama: { fontSize: 18, color: '#2D3436', fontWeight: '600' },
  harga: { fontSize: 13, color: '#00B894', marginTop: 4 },
  stockBox: { alignItems: 'center', minWidth: 50 },
  stockText: { fontSize: 24, fontWeight: '800', color: '#2D3436' },
  unit: { fontSize: 10, color: '#B2BEC3', textTransform: 'uppercase' },
  empty: { textAlign: 'center', marginTop: 50, color: '#B2BEC3' },
  fab: { 
    position: 'absolute', bottom: 30, right: 20, 
    backgroundColor: '#00B894', width: 60, height: 60, 
    borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 
  },
  fabText: { fontSize: 30, color: 'white', fontWeight: 'bold' }
});
