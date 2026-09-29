// components/IndikatorAQI.tsx
import { Text, View } from "react-native";
import { LaporanUdara } from "../types/cuaca";

export default function IndikatorAQI({ kota, indeksAQI, tingkat, diperbaruiPada }: LaporanUdara) {
  function getWarna(tingkat: LaporanUdara["tingkat"]) {
    switch (tingkat) {
      case "BAIK": return "green";
      case "SEDANG": return "orange";
      case "TIDAK_SEHAT": return "red";
      case "BERBAHAYA": return "darkred";
    }
  }

  return (
    <View style={{ padding: 16, borderRadius: 8, backgroundColor: "#F4F7FA" }}>
      <Text style={{ fontWeight: "bold", fontSize: 16 }}>{kota}</Text>
      <Text>Indeks AQI: {indeksAQI}</Text>
      <Text style={{ color: getWarna(tingkat), fontWeight: "bold" }}>
        Status: {tingkat}
      </Text>
      {diperbaruiPada && (
        <Text style={{ fontSize: 12, color: "gray" }}>
          Diperbarui: {diperbaruiPada}
        </Text>
      )}
    </View>
  );
}