import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../utils/theme';

export default function RootLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}
