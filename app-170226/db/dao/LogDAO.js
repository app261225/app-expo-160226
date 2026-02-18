import { db } from '../client';
import { log, produk } from '../schema';
import { eq, sql } from 'drizzle-orm';

export const LogDAO = {
  // 1. Catat Stok Masuk (IN) + Update Total Stok & InSum
  catatMasuk: async (idProduk, qty, idUser, notes = "") => {
    try {
      return await db.transaction(async (tx) => {
        // A. Tambah baris ke tabel LOG
        await tx.insert(log).values({
          idProduk,
          idPengguna: idUser,
          tipe: 'in',
          qty,
          notes,
          created: new Date()
        });

        // B. Update tabel PRODUK (Stock, InSum, dan InCount)
        await tx.update(produk)
          .set({
            stock: sql`${produk.stock} + ${qty}`,
            inSum: sql`${produk.inSum} + ${qty}`,
            inCount: sql`${produk.inCount} + 1`,
            updated: new Date()
          })
          .where(eq(produk.id, idProduk));

        return { success: true };
      });
    } catch (error) {
      console.error("Gagal catat stok masuk:", error);
      return { success: false, error };
    }
  },

  // 2. Catat Stok Keluar (OUT) + Update Total Stok & OutSum
  catatKeluar: async (idProduk, qty, idUser, notes = "") => {
    try {
      return await db.transaction(async (tx) => {
        // Cek dulu apakah stok cukup (Opsional tapi disarankan)
        const [item] = await tx.select().from(produk).where(eq(produk.id, idProduk));
        if (item.stock < qty) throw new Error("Stok tidak mencukupi!");

        // A. Tambah baris ke tabel LOG
        await tx.insert(log).values({
          idProduk,
          idPengguna: idUser,
          tipe: 'out',
          qty,
          notes,
          created: new Date()
        });

        // B. Update tabel PRODUK (Stock, OutSum, dan OutCount)
        await tx.update(produk)
          .set({
            stock: sql`${produk.stock} - ${qty}`,
            outSum: sql`${produk.outSum} + ${qty}`,
            outCount: sql`${produk.outCount} + 1`,
            updated: new Date()
          })
          .where(eq(produk.id, idProduk));

        return { success: true };
      });
    } catch (error) {
      console.error("Gagal catat stok keluar:", error);
      return { success: false, error: error.message };
    }
  },

  // 3. Ambil Riwayat Log untuk Produk Tertentu
  getLogByProduk: async (idProduk) => {
    return await db.select()
      .from(log)
      .where(eq(log.idProduk, idProduk))
      .orderBy(sql`${log.created} DESC`);
  }
};
