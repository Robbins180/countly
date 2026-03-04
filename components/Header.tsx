import { Ionicons } from "@expo/vector-icons";
import { Link, usePathname, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { theme } from "../utils/theme";

export function Header({ title = "Countly" }: { title?: string }) {
  const pathname = usePathname();
  const canGoBack = pathname !== "/";
  const router = useRouter();

  return (
    <View
      style={{
        paddingHorizontal: theme.pad,
        paddingTop: theme.pad,
        paddingBottom: 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {canGoBack && (
            <Pressable onPress={() => router.back()}>
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 16,
                  fontWeight: "800",
                }}
              >
                ← Back
              </Text>
            </Pressable>
          )}

          <Pressable onPress={() => router.replace("/")}>
            <Text
              style={{ color: theme.text, fontSize: 24, fontWeight: "700" }}
            >
              {title}
            </Text>
          </Pressable>
        </View>

        <Link href="/settings" asChild>
          <Pressable
            style={{
              height: 36,
              width: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Ionicons name="settings-outline" size={18} color={theme.subtext} />
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
