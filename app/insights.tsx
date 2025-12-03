import React from "react";
import { View, Pressable, Text } from "react-native";
import { useRouter } from "expo-router";

import InsightScreen from "../screens/InsightScreen";
import { theme } from  "../utils/theme";

export default function InsightsRoute() {
  const router = useRouter()

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Simple back button row */}
      <View
        style={{
          paddingHorizontal: theme.pad,
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            alignSelf: "flex-start",
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "#4b5563",
          }}
        >
          <Text style={{ color: "#e5e7eb", fontSize: 14 }}>← Back</Text>
        </Pressable>
      </View>

      {/* Actual Insights UI */}
      <View style={{ flex: 1 }}>
        <InsightScreen />
      </View>
    </View>
  );
}
