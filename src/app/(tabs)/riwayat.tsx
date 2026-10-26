// src/app/(tabs)/riwayat.tsx
import { useState, useCallback } from "react";
import { View, Text, Button, Alert, TouchableOpacity, ScrollView, Platform } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { ambilRiwayatPencarian } from "../../services/riwayatSearchStorage";
import { daftarKotaTersimpan, hapusCachePerKota } from "../../services/cacheRepository";
import { KotaFavorit } from "../../types/favorit";
import { RingkasanKotaTersimpan } from "../../types/cache";
import { useTheme } from "../../context/ThemeContext";

export default function TabRiwayat() {
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [riwayatCari, setRiwayatCari] = useState<string[]>([]);
  const [kotaCache, setKotaCache] = useState<RingkasanKotaTersimpan[]>([]);
  const { themeColors } = useTheme();

  useFocusEffect(
    useCallback(() => {
      ambilSemuaFavorit().then(setDaftarFavorit);
      ambilRiwayatPencarian().then(setRiwayatCari);
      
      // Di Web, SQLite tidak berjalan secara native
      if (Platform.OS !== "web") {
        daftarKotaTersimpan().then(setKotaCache);
      }
    }, [])
  );

  // Helper konfirmasi lintas platform (Web & Mobile)
  function konfirmasi(judul: string, pesan: string, aksiHapus: () => Promise<void>) {
    if (Platform.OS === "web") {
      if (window.confirm(`${judul}\n\n${pesan}`)) {
        aksiHapus();
      }
    } else {
      Alert.alert(judul, pesan, [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: aksiHapus },
      ]);
    }
  }

  function konfirmasiHapusFavorit(kota: KotaFavorit) {
    konfirmasi("Konfirmasi Hapus", `Yakin hapus ${kota.nama} dari favorit?`, async () => {
      await hapusFavorit(kota.id);
      setDaftarFavorit((prev) => prev.filter((k) => k.id !== kota.id));
    });
  }

  function konfirmasiHapusCache(kota: RingkasanKotaTersimpan) {
    konfirmasi("Hapus Cache", `Yakin hapus data cache cuaca ${kota.nama}?`, async () => {
      await hapusCachePerKota(kota.kunci);
      setKotaCache((prev) => prev.filter((k) => k.kunci !== kota.kunci));
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        {/* TUGAS 2: RIWAYAT PENCARIAN TERAKHIR */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: themeColors.text }}>
            Riwayat Pencarian (Maks 10)
          </Text>
          {riwayatCari.length === 0 ? (
            <Text style={{ color: themeColors.textSub }}>Belum ada riwayat pencarian</Text>
          ) : (
            riwayatCari.map((namaKota, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => router.push({ pathname: "/", params: { cari: namaKota } })}
                style={{
                  padding: 10,
                  backgroundColor: themeColors.card,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: themeColors.border,
                }}
              >
                <Text style={{ fontWeight: "500", color: themeColors.text }}>🔍 {namaKota}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* KOTA FAVORIT */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: themeColors.text }}>
            Kota Favorit
          </Text>
          <Text style={{ color: themeColors.textSub }}>Tersimpan {daftarFavorit.length} kota</Text>
          {daftarFavorit.length === 0 ? (
            <Text style={{ color: themeColors.textSub }}>Belum ada kota favorit</Text>
          ) : (
            daftarFavorit.map((kota) => (
              <View
                key={kota.id}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: themeColors.text }}>{kota.nama}</Text>
                <Button title="Hapus" color="red" onPress={() => konfirmasiHapusFavorit(kota)} />
              </View>
            ))
          )}
        </View>

        {/* TUGAS 3: CACHE KOTA (SQLITE) */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: themeColors.text }}>
            Cache Cuaca Tersimpan
          </Text>
          {Platform.OS === "web" ? (
            <Text style={{ color: themeColors.textSub }}>
              Fitur SQLite Cache disimulasikan khusus platform Mobile / Expo Go
            </Text>
          ) : kotaCache.length === 0 ? (
            <Text style={{ color: themeColors.textSub }}>Belum ada cache cuaca</Text>
          ) : (
            kotaCache.map((kota) => (
              <View
                key={kota.kunci}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: themeColors.text }}>{kota.nama}</Text>
                <Button title="Hapus Cache" color="orange" onPress={() => konfirmasiHapusCache(kota)} />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}