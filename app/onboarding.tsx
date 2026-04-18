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

const TAGS = [
  "ADHD-friendly",
  "No guilt trips",
  "No streaks",
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
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  async function finish() {
    await AsyncStorage.setItem(SEEN_KEY, "1");
    router.replace("/");
  }

  function next() {
    if (step < 3) setStep(step + 1);
    else finish();
  }

  const dots = (
    <View style={{ flexDirection: "row", gap: 6, marginBottom: 24 }}>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            width: i === step ? 18 : 6,
            height: 4,
            borderRadius: 999,
            backgroundColor: i === step ? accent : border,
          }}
        />
      ))}
    </View>
  );

  const cta = (label: string) => (
    <Pressable
      onPress={next}
      style={{
        width: "100%",
        paddingVertical: 14,
        borderRadius: 999,
        backgroundColor: accent,
        alignItems: "center",
        marginTop: "auto",
      }}
    >
      <Text style={{ color: bg, fontWeight: "600", fontSize: 15 }}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: bg,
        padding: 28,
        alignItems: "center",
      }}
    >
      {/* SCREEN 1 */}
      {step === 0 && (
        <View
          style={{
            flex: 1,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {dots}

          {/* Large clock icon */}
          <View
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              backgroundColor: card,
              borderWidth: 1,
              borderColor: border,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 28,
            }}
          >
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                borderWidth: 1.5,
                borderColor: accent,
                opacity: 0.4,
                position: "absolute",
              }}
            />
            <Text style={{ fontSize: 42 }}>🕐</Text>
          </View>

          <Text
            style={{
              fontSize: 30,
              fontWeight: "600",
              color: textPrimary,
              textAlign: "center",
              lineHeight: 38,
              marginBottom: 14,
            }}
          >
            Stop forgetting.{"\n"}Start noticing.
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: textMuted,
              textAlign: "center",
              lineHeight: 24,
              marginBottom: 32,
            }}
          >
            Countly tracks the things you always mean to do — quietly, without
            judgment.
          </Text>

          {cta("Get started")}

          <Pressable onPress={finish} style={{ marginTop: 14, padding: 8 }}>
            <Text style={{ color: border, fontSize: 13 }}>Skip for now</Text>
          </Pressable>
        </View>
      )}

      {/* SCREEN 2 */}
      {step === 1 && (
        <View
          style={{
            flex: 1,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {dots}

          <Text
            style={{
              fontSize: 30,
              fontWeight: "600",
              color: textPrimary,
              textAlign: "center",
              lineHeight: 38,
              marginBottom: 20,
            }}
          >
            One tap.{"\n"}That's it.
          </Text>

          {/* Counter card mock */}
          <View
            style={{
              width: "100%",
              backgroundColor: card,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: border,
              padding: 16,
              marginBottom: 10,
            }}
          >
            <Text
              style={{ color: textPrimary, fontWeight: "600", marginBottom: 4 }}
            >
              💇 Haircut
            </Text>
            <Text
              style={{
                fontSize: 36,
                fontWeight: "700",
                color: accent,
                lineHeight: 42,
              }}
            >
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

          <View
            style={{
              flexDirection: "row",
              gap: 10,
              width: "100%",
              marginBottom: 20,
            }}
          >
            {[
              ["🛢️ Oil", "12"],
              ["🏋️ Gym", "3"],
            ].map(([label, days]) => (
              <View
                key={label}
                style={{
                  flex: 1,
                  backgroundColor: card,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: border,
                  padding: 14,
                }}
              >
                <Text
                  style={{
                    color: textPrimary,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {label}
                </Text>
                <Text
                  style={{ fontSize: 24, fontWeight: "700", color: accent }}
                >
                  {days}
                </Text>
                <Text style={{ color: textMuted, fontSize: 11 }}>days</Text>
              </View>
            ))}
          </View>

          <Text
            style={{
              fontSize: 14,
              color: textMuted,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            No alarms. No pressure. Just awareness.
          </Text>

          {cta("Next")}
        </View>
      )}

      {/* SCREEN 3 */}
      {step === 2 && (
        <View
          style={{
            flex: 1,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {dots}

          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: card,
              borderWidth: 1,
              borderColor: border,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 44 }}>🧠</Text>
          </View>

          <Text
            style={{
              fontSize: 30,
              fontWeight: "600",
              color: textPrimary,
              textAlign: "center",
              lineHeight: 38,
              marginBottom: 14,
            }}
          >
            Built for brains{"\n"}that forget.
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: textMuted,
              textAlign: "center",
              lineHeight: 24,
              marginBottom: 24,
            }}
          >
            Not everyone thinks in reminders. Countly works with how you
            actually live.
          </Text>

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

          {cta("Next")}
        </View>
      )}

      {/* SCREEN 4 */}
      {step === 3 && (
        <View
          style={{
            flex: 1,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {dots}

          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: card,
              borderWidth: 1,
              borderColor: border,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 44 }}>✨</Text>
          </View>

          <Text
            style={{
              fontSize: 30,
              fontWeight: "600",
              color: textPrimary,
              textAlign: "center",
              lineHeight: 38,
              marginBottom: 14,
            }}
          >
            Add your first{"\n"}counter.
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: textMuted,
              textAlign: "center",
              lineHeight: 24,
              marginBottom: 24,
            }}
          >
            Pick something you want to keep track of.
          </Text>

          <View
            style={{
              width: "100%",
              backgroundColor: card,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: border,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <Text style={{ color: textMuted, fontSize: 11, marginBottom: 12 }}>
              Some ideas to get you started
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {IDEAS.map((idea) => (
                <View
                  key={idea}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: border,
                  }}
                >
                  <Text style={{ color: textPrimary, fontSize: 12 }}>
                    {idea}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {cta("Let's go")}
        </View>
      )}
    </View>
  );
}
