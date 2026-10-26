// src/services/riwayatSearchStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const KUNCI_RIWAYAT = "@jelajah_aman:riwayat_pencarian";

/**
 * Mengambil daftar riwayat pencarian kota yang tersimpan di lokal device.
 */
export async function ambilRiwayatPencarian(): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(KUNCI_RIWAYAT);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error("Gagal mengambil riwayat pencarian:", error);
    return [];
  }
}

/**
 * Menambahkan pencarian kota baru ke riwayat lokal.
 * - Menghapus duplikat nama kota jika sudah ada sebelumnya.
 * - Membatasi jumlah riwayat maksimal 10 kota terakhir.
 */
export async function tambahRiwayatPencarian(kota: string): Promise<void> {
  if (!kota || !kota.trim()) return;

  try {
    const namaBersih = kota.trim();
    let daftar = await ambilRiwayatPencarian();

    // Hapus jika kota sudah ada di riwayat (abaikan kapital/huruf kecil)
    daftar = daftar.filter(
      (item) => item.toLowerCase() !== namaBersih.toLowerCase()
    );

    daftar.unshift(namaBersih);

    
    if (daftar.length > 10) {
      daftar = daftar.slice(0, 10);
    }

    await AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(daftar));
  } catch (error) {
    console.error("Gagal menyimpan riwayat pencarian:", error);
  }
}


export async function hapusSemuaRiwayatPencarian(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KUNCI_RIWAYAT);
  } catch (error) {
    console.error("Gagal menghapus seluruh riwayat pencarian:", error);
  }
}