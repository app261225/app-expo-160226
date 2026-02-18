import { db } from '../client';
import { produk, log } from '../schema';
import { eq } from 'drizzle-orm';

export const ProdukDAO = {
  // Ambil semua produk yang belum dihapus (Soft Delete check)
  getAll: async () => {
    return await db.select().from(produk).where(eq(produk.deleted, null));
  },

  // Tambah Produk Baru + Catat di Log
  tambahProduk: async (dataProduk, idUser) => {
    try {
      // 1. Masukkan ke tabel produk
      const result = await db.insert(produk).values({
        ...dataProduk,
        created: new Date(),
      }).returning({ insertedId: produk.id });

      const newId = result[0].insertedId;

      // 2. Catat aksi ke tabel log
      await db.insert(log).values({
        idProduk: newId,
        idPengguna: idUser,
        tipe: 'in',
        qty: dataProduk.stock,
        notes: 'Inisialisasi stok awal',
        created: new Date(),
      });

      return { success: true, id: newId };
    } catch (error) {
      console.error("Gagal tambah produk:", error);
      return { success: false, error };
    }
  }
};
