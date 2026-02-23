import { View, Text, StyleSheet } from 'react-native';

export default function LogsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.empty}>Belum ada aktivitas stok.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  empty: {
    color: '#888',
    fontSize: 14,
  },
});