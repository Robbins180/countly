// app/_layout.tsx
import React, { useEffect, useState, createContext, useContext } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../utils/theme'; // adjust path if needed

const STORAGE_KEY = 'ui.palette';
const LEGACY_KEY  = '@countly:accent';
const BAD_KEY     = 'ui.plaette';

let __accentBootAt = Date.now(); // guards early bad writes


if (__DEV__) {
  const realSetItem = AsyncStorage.setItem.bind(AsyncStorage);

  AsyncStorage.setItem = async (key: string, value: string) => {
    if (key === STORAGE_KEY) {
      const early = Date.now() - __accentBootAt < 1000; // first 1s after boot
      // Block classic bad init: trying to force 'indigo' right after we loaded something else
      if (early && value === 'indigo') {
        console.log('[BLOCKED early overwrite → indigo]');
        return Promise.resolve();
      }
      console.log('[WRITE ui.palette]', value);
      console.log(new Error('[WRITE TRACE]').stack?.split('\n').slice(0,6).join('\n'));
    }
    return realSetItem(key, value);
  };
}




// ---------------- Context Setup ----------------
type Accent = 'indigo' | 'emerald' | 'amber' | string;
type AccentCtx = { accent: Accent; setAccent: (a: Accent) => Promise<void> };

const AccentContext = createContext<AccentCtx | null>(null);
export const useAccent = () => {
  const ctx = useContext(AccentContext);
  if (!ctx) throw new Error('useAccent must be used within AccentContext.Provider');
  return ctx;
};

// const STORAGE_KEY = '@countly:accent';

// ---------------- Root Layout ----------------
export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [accent, _setAccent] = useState<Accent>('indigo'); // fallback only

  // Unified setter (updates state + theme + storage)
  const setAccent = async (a: Accent) => {
    console.log('[SET ACCENT called]', a);  // <— who is calling this?
    _setAccent(a);
    theme.accent = a;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, a);
      AsyncStorage.removeItem(LEGACY_KEY).catch(() => {});
      AsyncStorage.removeItem(BAD_KEY).catch(() => {});
    } catch {}
  };



  // Load saved accent before first paint
  useEffect(() => {
    console.log("[ACCENT STATE]", accent);
    (async () => {
      
      try {
        const [legacy, palette] = await Promise.all([
          AsyncStorage.getItem(LEGACY_KEY),
          AsyncStorage.getItem(STORAGE_KEY),
        ]);

        let next = (palette ?? legacy ?? 'indigo') as Accent;

        // one-time migration
        if (legacy && !palette) {
          await AsyncStorage.setItem(STORAGE_KEY, legacy);
          await AsyncStorage.removeItem(LEGACY_KEY);
          console.log('Migrated accent from @countly:accent → ui.palette:', legacy);
        }

        // typo cleanup (best-effort)
        AsyncStorage.removeItem(BAD_KEY).catch(() => {});

        _setAccent(next);
        theme.accent = next;

        // ensure we persist default once
        if (!palette && !legacy) {
          await AsyncStorage.setItem(STORAGE_KEY, next);
        }

        console.log('Accent loaded (unified):', next);
      } finally {
        setReady(true);
      }
    })();
  },[accent]);


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
