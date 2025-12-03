import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../utils/theme";

export default function SettingsRoute() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, padding: theme.pad }}>
      {/* Back button */}
      <Pressable
        onPress={() => router.back()}
        style={{
          alignSelf: "flex-start",
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: theme.border,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: theme.text }}>← Back</Text>
      </Pressable>

      {/* Simple placeholder content */}
      <Text style={{ color: theme.text, fontSize: 18, fontWeight: "700" }}>
        Settings (coming soon)
      </Text>
      <Text style={{ color: "#9ca3af", marginTop: 8 }}>
        This is just a placeholder so the settings wheel doesn&apos;t crash.  
        We&apos;ll wire real options here later.
      </Text>
    </View>
  );
}
