// db/client.js
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

const expoDb = openDatabaseSync('stock_app.db', {
  enableChangeListener: true, // Fitur 2026 untuk auto-refresh UI saat data berubah
});

export const db = drizzle(expoDb, { schema });
