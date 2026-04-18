import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

const SEEN_KEY = "onboarding.seen";

const bg = "#0D1018";
const card = "#141A28";
const accent = "#7AA0C8";
const border = "#1A2030";
const textPrimary = "#E8EDF5";
const textMuted = "#5A6880";

const SCREENS = [
  {
    key: "welcome",
    icon: "🕐",
    title: "Stop forgetting.\nStart noticing.",
    body: "Countly tracks the things you always mean to do but forget — quietly, without judgment.",
    cta: "Get started",
    showSkip: true,
    detail: null,
  },
  {
    key: "how",
    icon: "👆",
    title: "One tap.\nThat's it.",
    body: "See how long it's been. Tap to reset the clock. No alarms, no pressure.",
    cta: "Next",
    showSkip: false,
    detail: "counter",
  },
  {
    key: "who",
    icon: "🧠",
    title: "Built for brains\nthat forget.",
    body: "Not everyone thinks in reminders and alarms. Countly works with how you actually live.",
    cta: "Next",
    showSkip: false,
    detail: "tags",
  },
  {
    key: "start",
    icon: "✨",
    title: "Add your first\ncounter.",
    body: "Pick something you want to keep track of. Haircut? Oil change? Calling your parents?",
    cta: "Let's go",
    showSkip: false,
    detail: "ideas",
  },
];

const TAGS = [
  "ADHD-friendly",
  "No guilt trips",
  "No streaks to break",
  "Your pace",
  "Low friction",
  "Calm by design",
];
const IDEAS = [
  "💇 Haircut",
  "🛢️ Oil change",
  "🏋️ Workout",
  "💊 Medication",
  "📞 Call family",
  "🧹 Clean house",
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const screen = SCREENS[step];

  async function finish() {
    await AsyncStorage.setItem(SEEN_KEY, "1");
    router.replace("/");
  }

  function next() {
    if (step < SCREENS.length - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
        padding: 28,
      }}
    >
      {/* Dots */}
      <View style={{ flexDirection: "row", gap: 6, marginBottom: 36 }}>
        {SCREENS.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === step ? 18 : 6,
              height: 6,
              borderRadius: 999,
              backgroundColor: i === step ? accent : border,
            }}
          />
        ))}
      </View>

      {/* Icon */}
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: card,
          borderWidth: 1,
          borderColor: border,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <Text style={{ fontSize: 28 }}>{screen.icon}</Text>
      </View>

      {/* Title */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: "600",
          color: textPrimary,
          textAlign: "center",
          lineHeight: 36,
          marginBottom: 12,
        }}
      >
        {screen.title}
      </Text>

      {/* Body */}
      <Text
        style={{
          fontSize: 15,
          color: textMuted,
          textAlign: "center",
          lineHeight: 24,
          marginBottom: 24,
        }}
      >
        {screen.body}
      </Text>

      {/* Detail block */}
      {screen.detail === "counter" && (
        <View style={{ width: "100%", marginBottom: 24 }}>
          <View
            style={{
              backgroundColor: card,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: border,
              padding: 16,
              marginBottom: 8,
            }}
          >
            <Text
              style={{ color: textPrimary, fontWeight: "600", marginBottom: 4 }}
            >
              💇 Haircut
            </Text>
            <Text style={{ color: accent, fontSize: 32, fontWeight: "700" }}>
              34
            </Text>
            <Text style={{ color: textMuted, fontSize: 12 }}>days since</Text>
            <View
              style={{
                marginTop: 8,
                alignSelf: "flex-start",
                paddingVertical: 3,
                paddingHorizontal: 10,
                borderRadius: 999,
                backgroundColor: "#2a1515",
              }}
            >
              <Text
                style={{ color: "#ef6f6f", fontSize: 11, fontWeight: "600" }}
              >
                overdue
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: card,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: border,
                padding: 12,
              }}
            >
              <Text
                style={{ color: textPrimary, fontSize: 12, fontWeight: "600" }}
              >
                🛢️ Oil Change
              </Text>
              <Text style={{ color: accent, fontSize: 22, fontWeight: "700" }}>
                12
              </Text>
              <Text style={{ color: textMuted, fontSize: 11 }}>days since</Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: card,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: border,
                padding: 12,
              }}
            >
              <Text
                style={{ color: textPrimary, fontSize: 12, fontWeight: "600" }}
              >
                🏋️ Workout
              </Text>
              <Text style={{ color: accent, fontSize: 22, fontWeight: "700" }}>
                3
              </Text>
              <Text style={{ color: textMuted, fontSize: 11 }}>days since</Text>
            </View>
          </View>
        </View>
      )}

      {screen.detail === "tags" && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          {TAGS.map((tag) => (
            <View
              key={tag}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: border,
                backgroundColor: card,
              }}
            >
              <Text style={{ color: textMuted, fontSize: 12 }}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {screen.detail === "ideas" && (
        <View
          style={{
            width: "100%",
            backgroundColor: card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: border,
            padding: 14,
            marginBottom: 24,
          }}
        >
          <Text style={{ color: textMuted, fontSize: 11, marginBottom: 10 }}>
            Some ideas to get you started
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {IDEAS.map((idea) => (
              <View
                key={idea}
                style={{
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: border,
                }}
              >
                <Text style={{ color: textPrimary, fontSize: 12 }}>{idea}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* CTA */}
      <Pressable
        onPress={next}
        style={{
          width: "100%",
          paddingVertical: 14,
          borderRadius: 999,
          backgroundColor: accent,
          alignItems: "center",
        }}
      >
        <Text style={{ color: bg, fontWeight: "600", fontSize: 15 }}>
          {screen.cta}
        </Text>
      </Pressable>

      {/* Skip */}
      {screen.showSkip && (
        <Pressable onPress={finish} style={{ marginTop: 14, padding: 8 }}>
          <Text style={{ color: textMuted, fontSize: 13 }}>Skip</Text>
        </Pressable>
      )}
    </View>
  );
}
