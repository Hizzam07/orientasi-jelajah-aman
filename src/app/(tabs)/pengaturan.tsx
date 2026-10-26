// src/app/(tabs)/pengaturan.tsx
import { useState } from "react";
import { Text, Button, View, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { hapusSemuaCache } from "../../services/cacheRepository";
import { useTheme } from "../../context/ThemeContext";

export default function TabPengaturan() {
  const [pesan, setPesan] = useState<string | null>(null);
  const { pilihanTema, setTema, themeColors, isDark } = useTheme();

  // Konfirmasi Alert sebelum hapus cache (Tugas 3 UTS)
  function konfirmasiHapusCache() {
    Alert.alert(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus seluruh data cuaca tersimpan?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            await hapusSemuaCache();
            setPesan("Data cuaca tersimpan sudah dihapus.");
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: themeColors.bg,
        padding: 16,
        gap: 16,
      }}
    >
      {/* Header Info Aplikasi */}
      <View>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: themeColors.text,
          }}
        >
          Jelajah Aman
        </Text>
        <Text style={{ color: themeColors.textSub }}>Versi 1.0.0</Text>
      </View>

      {/* TUGAS 4 UTS: Mode Tampilan (Dark/Light Mode dengan ThemeContext) */}
      <View style={{ gap: 8 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: themeColors.text,
          }}
        >
          Mode Tampilan
        </Text>
        <Text style={{ fontSize: 12, color: themeColors.textSub }}>
          Status saat ini: {isDark ? "Gelap (Dark)" : "Terang (Light)"}
        </Text>

        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["terang", "gelap", "sistem"] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => setTema(mode)}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor:
                  pilihanTema === mode ? "#007AFF" : themeColors.border,
                backgroundColor:
                  pilihanTema === mode ? "#007AFF22" : themeColors.card,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: themeColors.text,
                  fontWeight: pilihanTema === mode ? "bold" : "normal",
                }}
              >
                {mode === "terang"
                  ? "☀️ Terang"
                  : mode === "gelap"
                  ? "🌙 Gelap"
                  : "📱 Sistem"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ gap: 8, marginTop: 8 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: themeColors.text,
          }}
        >
          Penyimpanan Cache
        </Text>
        <Button
          title="Hapus Data Cuaca Tersimpan"
          onPress={konfirmasiHapusCache}
        />
        {pesan && <Text style={{ color: "green" }}>{pesan}</Text>}
      </View>
    </SafeAreaView>
  );
}