import { View, Text, StyleSheet } from 'react-native';

export default function LogsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Logs</Text>
      <Text style={styles.sub}>Belum ada konten</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  text: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  sub: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
  },
});