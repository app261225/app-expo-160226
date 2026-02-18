import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// TABEL PENGGUNA
export const pengguna = sqliteTable('pengguna', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  nama: text('nama'),
  role: text('role').default('staff'),
  lastAktif: integer('last_aktif', { mode: 'timestamp' }),
  created: integer('created', { mode: 'timestamp' }).default(new Date()),
  updated: integer('updated', { mode: 'timestamp' }),
  deleted: integer('deleted', { mode: 'timestamp' }),
});

// TABEL PRODUK
export const produk = sqliteTable('produk', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sku: text('sku').unique(),
  nama: text('nama').notNull(),
  stockMin: integer('stock_min').default(0),
  stock: integer('stock').default(0),
  modalNonRp: real('modal_non_rp'),
  mataUangNonRp: text('mata_uang_non_rp'),
  modalRp: integer('modal_rp'), // Simpan dalam integer
  jual: integer('jual'),
  inSum: integer('in_sum').default(0),
  outSum: integer('out_sum').default(0),
  inCount: integer('in_count').default(0),
  outCount: integer('out_count').default(0),
  created: integer('created', { mode: 'timestamp' }).default(new Date()),
  updated: integer('updated', { mode: 'timestamp' }),
  deleted: integer('deleted', { mode: 'timestamp' }),
});

// TABEL LOG
export const log = sqliteTable('log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  idProduk: integer('id_produk').references(() => produk.id),
  idPengguna: integer('id_pengguna').references(() => pengguna.id),
  tipe: text('tipe'), // 'in' atau 'out'
  qty: integer('qty').notNull(),
  notes: text('notes'),
  created: integer('created', { mode: 'timestamp' }).default(new Date()),
  updated: integer('updated', { mode: 'timestamp' }),
  deleted: integer('deleted', { mode: 'timestamp' }),
});
