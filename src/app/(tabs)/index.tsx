// src/app/(tabs)/index.tsx
import { useState, useEffect, useRef } from "react";
import { View, Text, ActivityIndicator, Button, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import { ambilCuaca } from "../../services/weatherService";
import { ambilKualitasUdara } from "../../services/airQualityService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { HasilGeocoding } from "../../types/geocoding";
import { DataCuacaLengkap, DataKualitasUdara } from "../..//types/weather";
import { mintaIzinLokasi, ambilKoordinatSaatIni } from "../../services/locationService";
import { router } from "expo-router";
import { ambilSemuaFavorit } from "../../services/favoritStorage";

export default function HalamanUtama() {
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [cuaca, setCuaca] = useState<DataCuacaLengkap | null>(null);
  const [kualitasUdara, setKualitasUdara] = useState<DataKualitasUdara | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const [isFavorit, setIsFavorit] = useState<boolean>(false);


  useEffect(() => {
    async function cekStatusFavorit() {
      if (kotaTerpilih) {
        const daftar = await ambilSemuaFavorit();
        const sudahAda = daftar.some((k) => k.id === kotaTerpilih.id);
        setIsFavorit(sudahAda);
      } else {
        setIsFavorit(false);
      }
    }
    cekStatusFavorit();
  }, [kotaTerpilih]);

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }
    cariKota(teksTertunda).then(setHasilPencarian).catch(() => setHasilPencarian([]));
  }, [teksTertunda]);

  async function pilihKota(kota: HasilGeocoding) {
    setKotaTerpilih(kota);
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);

    try {
      const [dataCuaca, dataAQI] = await Promise.all([
        ambilCuaca(kota.latitude, kota.longitude),
        ambilKualitasUdara(kota.latitude, kota.longitude),
      ]);

      if (idSaatIni !== requestIdRef.current) return;

      setCuaca(dataCuaca);
      setKualitasUdara(dataAQI);
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      if (err instanceof Error) {
        setPesanError(err.message);
      } else {
        setPesanError("Terjadi kesalahan saat memuat data.");
      }
    } finally {
      if (idSaatIni === requestIdRef.current) {
        setSedangMemuat(false);
      }
    }
  }
  async function gunakanLokasiSaatIni() {
const status = await mintaIzinLokasi();
if (status === "denied") {
setPesanLokasi("Izin lokasi ditolak. Silakan cari kota secara manual di atas.");
return;
}
if (status === "unavailable") {
setPesanLokasi("Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secaramanual.");
return;
}
setPesanLokasi(null);
const koordinat = await ambilKoordinatSaatIni();
pilihKota({
id: -1,
name: "Lokasi Saat Ini",
latitude: koordinat.latitude,
longitude: koordinat.longitude,
country: "",
});
}

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
     <SearchBox onCari={setTeksCari} />
     <Button title="Gunakan Lokasi Saat Ini" onPress={gunakanLokasiSaatIni} />
     {pesanLokasi && <Text>{pesanLokasi}</Text>}

      {hasilPencarian.length > 0 && (
        <View style={{ marginVertical: 8 }}>
          {hasilPencarian.map((item) => (
            <TouchableOpacity
              key={`${item.latitude}-${item.longitude}`}
              onPress={() => {
                pilihKota(item);
                setHasilPencarian([]);
              }}
              style={{ paddingVertical: 8 }}
            >
              <Text>{item.name}, {item.country}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {sedangMemuat && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      {pesanError && (
        <View style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={{ color: "red", marginBottom: 10 }}>{pesanError}</Text>
          <Button title="Coba Lagi" onPress={() => kotaTerpilih && pilihKota(kotaTerpilih)} />
        </View>
      )}

      {!sedangMemuat && !pesanError && cuaca && kotaTerpilih && (
        <View style={{ marginTop: 20 }}>
          <WeatherCard
            kota={kotaTerpilih.name}
            suhu={cuaca.saatIni.suhu}
            tingkatAQI={kualitasUdara ? konversiTingkatAQI(kualitasUdara.indeksAQI) : "BAIK"}
            indeksAQI={kualitasUdara?.indeksAQI}
          />
          <Button
            title={isFavorit ? "Sudah di Favorit" : "Tambahkan ke Favorit"}
            disabled={isFavorit}
            onPress={() =>
              router.push({
                pathname: "/tambah-favorit",
                params: {
                  id: String(kotaTerpilih.id),
                  nama: kotaTerpilih.name,
                  lat: String(kotaTerpilih.latitude),
                  lon: String(kotaTerpilih.longitude),
                },
              })
            }
          />
          

          {/* 1. Menampilkan Suhu Maksimal & Minimal Harian */}
          <View style={{ marginTop: 8, paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 14, color: "#555" }}>
              Maks: {cuaca.harian.suhuMaksimal[0]}°C | Min: {cuaca.harian.suhuMinimal[0]}°C
            </Text>
          </View>

          {/* 2. Menampilkan PM2.5 dan PM10 di dekat Atribusi */}
          {kualitasUdara && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 12, color: "#666" }}>
                PM2.5: {kualitasUdara.pm25} µg/m³ | PM10: {kualitasUdara.pm10} µg/m³
              </Text>
            </View>
          )}

          <AtribusiCuaca />
        </View>
      )}
    </SafeAreaView>
  );
}
// // src/app/(tabs)/index.tsx
// import { useState, useEffect, useRef } from "react";
// import { View, Text, ActivityIndicator, Button, TouchableOpacity } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import SearchBox from "../../components/SearchBox";
// import WeatherCard from "../../components/WeatherCard";
// import AtribusiCuaca from "../../components/AtribusiCuaca";
// import { useDebounce } from "../../hooks/use-debounce";
// import { cariKota } from "../../services/geocodingService";
// import { ambilCuaca } from "../../services/weatherService";
// import { ambilKualitasUdara } from "../../services/airQualityService";
// import { konversiTingkatAQI } from "../../services/weatherAdapter";
// import { labelKodeCuaca } from "../../constants/weatherCodes";
// import { HasilGeocoding } from "../../types/geocoding";
// import { DataCuacaLengkap, DataKualitasUdara } from "../../types/weather";
// export default function HalamanUtama() {
// const [teksCari, setTeksCari] = useState("");
// const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
// const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
// const [cuaca, setCuaca] = useState<DataCuacaLengkap | null>(null);
// const [kualitasUdara, setKualitasUdara] = useState<DataKualitasUdara | null>(null);
// const [sedangMemuat, setSedangMemuat] = useState(false);
// const [pesanError, setPesanError] = useState<string | null>(null);
// const teksTertunda = useDebounce(teksCari, 500);
// const requestIdRef = useRef(0); // pencegah race condition
// useEffect(() => {
// if (teksTertunda.trim().length === 0) {
// setHasilPencarian([]);
// return;
// }
// cariKota(teksTertunda).then(setHasilPencarian).catch(() => setHasilPencarian([]));
// }, [teksTertunda]);
// async function pilihKota(kota: HasilGeocoding) {
// setKotaTerpilih(kota);
// const idSaatIni = ++requestIdRef.current;
// setSedangMemuat(true);
// setPesanError(null);
// try {
// const [dataCuaca, dataAQI] = await Promise.all([
// ambilCuaca(kota.latitude, kota.longitude),
// ambilKualitasUdara(kota.latitude, kota.longitude),
// ]);
// if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan
// setCuaca(dataCuaca);

// setKualitasUdara(dataAQI);
// } catch (err) {
// if (idSaatIni !== requestIdRef.current) return;
// setPesanError("Gagal memuat data cuaca. Periksa koneksi internet Anda.");
// } finally {
// if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
// }
// }
// return (
// <SafeAreaView style={{ flex: 1, padding: 16, gap: 16 }}>
// <SearchBox onCari={setTeksCari} />
// {hasilPencarian.map((kota) => (
// <TouchableOpacity key={kota.id} onPress={() => pilihKota(kota)}>
// <Text>{kota.name}</Text>
// </TouchableOpacity>
// ))}
// {sedangMemuat && <ActivityIndicator />}
// {pesanError && (
// <View>
// <Text>{pesanError}</Text>
// <Button
// title="Coba Lagi"
// onPress={() => kotaTerpilih && pilihKota(kotaTerpilih)}
// />
// </View>
// )}
// {cuaca && kualitasUdara && kotaTerpilih && !sedangMemuat && (
// <WeatherCard
// kota={kotaTerpilih.name}
// suhu={cuaca.saatIni.suhu}
// tingkatAQI={konversiTingkatAQI(kualitasUdara.indeksAQI)}
// indeksAQI={kualitasUdara.indeksAQI}
// />
// )}
// {cuaca && (
// <Text style={{ fontSize: 12, color: "#888" }}>
// Kondisi: {labelKodeCuaca(cuaca.saatIni.kodeCuaca)} • Angin
// {cuaca.saatIni.kecepatanAngin} km/j
// </Text>
// )}
// <AtribusiCuaca />
// </SafeAreaView>
// );
// }