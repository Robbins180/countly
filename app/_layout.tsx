import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../utils/theme";

const SEEN_KEY = "onboarding.seen";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem(SEEN_KEY).then((val) => {
      if (!val) {
        router.replace("/onboarding");
      }
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}
