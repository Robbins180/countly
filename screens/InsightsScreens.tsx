import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PieDonut, { PieSlice } from "../components/PieDonut";

type Counter = {
  id: string;
  name: string;
  emoji?: string;
  color?: string;   // optional accent
  value: number;    // current total
};

// --- STORAGE ADAPTER (adjust keys here if needed) ---
async function loadCounters(): Promise<Counter[]> {
  const keys = ["countly:counters", "@Countly:counters", "counters"];
  for (const key of keys) {
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as Counter[];
        if (parsed && Array.isArray(parsed.items)) return parsed.items as Counter[];
      } catch {}
    }
  }
  return [];
}

export default function InsightsScreen() {
  const [counters, setCounters] = useState<Counter[] | null>(null);

  useEffect(() => {
    (async () => {
      const items = await loadCounters();
      setCounters(items);
    })();
  }, []);

  const slices: PieSlice[] = useMemo(() => {
    if (!counters?.length) return [];
    return counters
      .filter(c => (c.value ?? 0) > 0)
      .map(c => ({
        label: c.emoji ? `${c.emoji} ${c.name}` : c.name,
        value: c.value ?? 0,
        color: c.color, // fallback happens inside PieDonut
      }));
  }, [counters]);

  const total = useMemo(() => slices.reduce((s, d) => s + d.value, 0), [slices]);

  if (counters === null) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading insights…</Text>
      </View>
    );
  }

  if (!slices.length) {
    return (
      <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>No data yet</Text>
        <Text style={{ color: "#6B7280", textAlign: "center" }}>
          Add some counts and come back for a visual breakdown.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>Insights</Text>
      <Text style={{ color: "#6B7280", marginBottom: 16 }}>
        Distribution of totals per counter
      </Text>

      <PieDonut data={slices} centerLabel="Totals" />

      {/* Legend */}
      <View style={{ marginTop: 16 }}>
        <FlatList
          data={[...slices].sort((a, b) => b.value - a.value)}
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: item.color || "#9CA3AF", marginRight: 8 }} />
                <Text style={{ flex: 1 }}>{item.label}</Text>
                <Text style={{ fontVariant: ["tabular-nums"], color: "#111827" }}>{item.value}</Text>
                <Text style={{ width: 40, textAlign: "right", marginLeft: 8, color: "#6B7280" }}>{pct}%</Text>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}
