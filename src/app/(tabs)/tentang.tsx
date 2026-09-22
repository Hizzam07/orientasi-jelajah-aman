// src/app/(tabs)/tentang.tsx
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typeScale, spacing } from "../../constants/styles";

export default function TabTentang() {
  return (
    <SafeAreaView style={{ flex: 1, padding: spacing.sedang, gap: spacing.kecil }}>
      <Text
        style={{ fontSize: typeScale.judul, fontWeight: "bold" }}
        accessibilityLabel="Judul halaman: Jelajah Aman"
      >
        Jelajah Aman
      </Text>
      
      <Text style={{ fontSize: typeScale.subjudul }}>
        Versi 1.0.0
      </Text>

      <Text style={{ fontSize: typeScale.isi, marginTop: spacing.kecil }}>
        Pengembang: [Hizzam]
      </Text>
      
      <Text style={{ fontSize: typeScale.keterangan, color: "gray" }}>
        Aplikasi pemantau cuaca dan kualitas udara untuk navigasi yang lebih aman.
      </Text>
    </SafeAreaView>
  );
}