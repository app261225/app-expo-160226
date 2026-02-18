import { db } from '../client';
import { pengguna } from '../schema';
import { eq, and } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

export const PenggunaDAO = {
  // 1. Fungsi untuk Hash Password (Internal)
  _hashPassword: async (password) => {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
  },

  // 2. Registrasi Pengguna Baru
  register: async (username, password, nama, role = 'staff') => {
    try {
      const hashedPassword = await PenggunaDAO._hashPassword(password);
      
      const result = await db.insert(pengguna).values({
        username,
        password: hashedPassword,
        nama,
        role,
        created: new Date(),
      }).returning({ id: pengguna.id });

      return { success: true, id: result[0].id };
    } catch (error) {
      console.error("Registrasi gagal:", error);
      return { success: false, error: "Username mungkin sudah terpakai" };
    }
  },

  // 3. Login Pengguna
  login: async (username, password) => {
    try {
      const hashedPassword = await PenggunaDAO._hashPassword(password);
      
      const user = await db.query.pengguna.findFirst({
        where: and(
          eq(pengguna.username, username),
          eq(pengguna.password, hashedPassword),
          eq(pengguna.deleted, null)
        )
      });

      if (user) {
        // Update waktu aktif terakhir secara async
        await db.update(pengguna)
          .set({ lastAktif: new Date() })
          .where(eq(pengguna.id, user.id));
          
        return { success: true, user };
      } else {
        return { success: false, error: "Username atau Password salah" };
      }
    } catch (error) {
      return { success: false, error: "Terjadi kesalahan sistem" };
    }
  },

  // 4. Ambil Semua Pengguna (untuk Admin)
  getAll: async () => {
    return await db.select({
      id: pengguna.id,
      username: pengguna.username,
      nama: pengguna.nama,
      role: pengguna.role,
      lastAktif: pengguna.lastAktif
    }).from(pengguna).where(eq(pengguna.deleted, null));
  }
};
