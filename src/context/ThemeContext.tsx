// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ModeTema = "sistem" | "terang" | "gelap";

interface ThemeContextType {
  pilihanTema: ModeTema;
  setTema: (tema: ModeTema) => void;
  isDark: boolean;
  themeColors: {
    bg: string;
    card: string;
    text: string;
    textSub: string;
    border: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [pilihanTema, setPilihanTema] = useState<ModeTema>("sistem");

  useEffect(() => {
    AsyncStorage.getItem("@jelajah_aman:tema").then((val) => {
      if (val) setPilihanTema(val as ModeTema);
    });
  }, []);

  const setTema = (tema: ModeTema) => {
    setPilihanTema(tema);
    AsyncStorage.setItem("@jelajah_aman:tema", tema);
  };

  const isDark =
    pilihanTema === "sistem" ? systemScheme === "dark" : pilihanTema === "gelap";

  const themeColors = {
    bg: isDark ? "#121212" : "#F4F7FA",
    card: isDark ? "#1E1E1E" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#000000",
    textSub: isDark ? "#AAAAAA" : "#666666",
    border: isDark ? "#333333" : "#CCCCCC",
  };

  return (
    <ThemeContext.Provider value={{ pilihanTema, setTema, isDark, themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme harus digunakan di dalam ThemeProvider");
  return context;
}