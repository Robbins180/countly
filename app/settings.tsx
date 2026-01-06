import { useRouter } from "expo-router";
import React from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { getPaywallSubtitle } from "../utils/pro";
import { theme } from "../utils/theme";


export default function SettingsRoute() {
  const router = useRouter();
  const isPro = false; // TODO: wire to purchases later


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
            {!isPro && (
      <Pressable
        onPress={() =>
          Alert.alert(
            "Upgrade to Pro",
            `${getPaywallSubtitle("counters")}\n\nPro also removes category limits and unlocks full history.`
          )
        }
        style={{
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 16,
          padding: 14,
          marginBottom: 20,
          backgroundColor: "#0b1220",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.text,
              fontSize: 14,
              fontWeight: "700",
            }}
          >
            Upgrade to Pro
          </Text>
          <Text
            style={{
              color: "#9ca3af",
              fontSize: 12,
              marginTop: 2,
            }}
          >
            Remove limits and keep building.
          </Text>
        </View>

        <View
          style={{
            paddingVertical: 4,
            paddingHorizontal: 10,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "#4f46e5",
            backgroundColor: "#111827",
          }}
        >
          <Text
            style={{
              color: "#cfe1ff",
              fontSize: 11,
              fontWeight: "800",
              letterSpacing: 0.6,
            }}
          >
            PRO
          </Text>
        </View>
      </Pressable>
    )}

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
