import { db } from '../client';
import { produk, log } from '../schema';
import { eq, sql, desc, isNull } from 'drizzle-orm';

export const InventoryDAO = {
  // Ambil semua produk aktif
  getProdukAktif: async () => {
    return await db.select().from(produk)
      .where(isNull(produk.deleted))
      .orderBy(desc(produk.updated));
  },

  // Transaksi Stok (Masuk/Keluar)
  updateStok: async (idProduk, qty, tipe, idUser, notes = "") => {
    try {
      return await db.transaction(async (tx) => {
        // 1. Catat Log
        await tx.insert(log).values({
          idProduk, idPengguna: idUser, tipe, qty, notes, created: new Date()
        });

        // 2. Update Produk (Gunakan SQL operator untuk akurasi)
        const isIn = tipe === 'in';
        await tx.update(produk)
          .set({
            stock: isIn ? sql`${produk.stock} + ${qty}` : sql`${produk.stock} - ${qty}`,
            inSum: isIn ? sql`${produk.inSum} + ${qty}` : produk.inSum,
            outSum: !isIn ? sql`${produk.outSum} + ${qty}` : produk.outSum,
            inCount: isIn ? sql`${produk.inCount} + 1` : produk.inCount,
            outCount: !isIn ? sql`${produk.outCount} + 1` : produk.outCount,
            updated: new Date()
          })
          .where(eq(produk.id, idProduk));
        
        return { success: true };
      });
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};
