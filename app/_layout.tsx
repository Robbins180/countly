// app/_layout.tsx
import React, { useEffect, useState, createContext, useContext } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../utils/theme'; // adjust path if needed

// ---------------- Context Setup ----------------
type Accent = 'indigo' | 'emerald' | 'amber' | string;
type AccentCtx = { accent: Accent; setAccent: (a: Accent) => Promise<void> };

const AccentContext = createContext<AccentCtx | null>(null);
export const useAccent = () => {
  const ctx = useContext(AccentContext);
  if (!ctx) throw new Error('useAccent must be used within AccentContext.Provider');
  return ctx;
};

const STORAGE_KEY = '@countly:accent';

// ---------------- Root Layout ----------------
export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [accent, _setAccent] = useState<Accent>('indigo'); // fallback only

  // Unified setter (updates state + theme + storage)
  const setAccent = async (a: Accent) => {
    _setAccent(a);
    theme.accent = a;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, a);
      console.log("Accent Saved", a);
    } catch {}
  };

  // Load saved accent before first paint
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        
        const keys = await AsyncStorage.getAllKeys();
        console.log('All AsyncStorage keys:', keys);

        const entries = await AsyncStorage.multiGet(keys);
        console.log('All AsyncStorage entries:', Object.fromEntries(entries));

        const next = (saved ?? 'indigo') as Accent;
        _setAccent(next);
        theme.accent = next;
        if (!saved) await AsyncStorage.setItem(STORAGE_KEY, next);
        console.log("Accent loaded from storage", saved);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Avoid flash of default color before load
  if (!ready) return <View style={{ flex: 1, backgroundColor: '#0B0B0C' }} />;

  return (
    <AccentContext.Provider value={{ accent, setAccent }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B0C' }}>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
    </AccentContext.Provider>
  );
}
