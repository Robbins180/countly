import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import useInsightMockData from "../hooks/useInsightMockData";
import { useHistoryThisWeek } from "../hooks/useHistoryThisWeek";



export default function InsightScreen() {
  const {
    total,
    activeDays,
    topCounter,
    segments,
    change,
    changePercent,
    isUp,
    thisWeekTotal,
  } = useInsightMockData();

  const history = useHistoryThisWeek();

  const dueSegment = segments.find((s) => s.label === "Due");
  const soonSegment = segments.find((s) => s.label === "Due soon");
  const dueCount = dueSegment?.value ?? 0;
  const soonCount = soonSegment?.value ?? 0;


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>Your counters at a glance</Text>
      </View>

      {/* Weekly Snapshot */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekly Snapshot</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total counters</Text>
            <Text style={styles.statValue}>{total}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Updated recently</Text>
            <Text style={styles.statValue}>{activeDays}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Most overdue</Text>
            <Text style={styles.statValueSmall} numberOfLines={1}>
              {topCounter}
            </Text>
          </View>
        </View>


        <Text style={styles.cardHint}>Based on your last 7 days in Countly</Text>
      </View>

      {/* Pie "donut" mock */}
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Where your effort is going</Text>
        <View style={styles.chartRow}>
          {/* Donut placeholder */}
          <View style={styles.donutOuter}>
            <View style={styles.donutInner}>
              <Text style={styles.donutCenterValue}>{total}</Text>
              <Text style={styles.donutCenterLabel}>events</Text>
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            {segments.map((segment) => (
              <View key={segment.label} style={styles.legendRow}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: segment.color },
                  ]}
                />
                <View style={styles.legendTextBlock}>
                  <Text style={styles.legendLabel}>{segment.label}</Text>
                  <Text style={styles.legendValue}>
                    {segment.value} (
                    {Math.round((segment.value / total) * 100)}
                    %)
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Week-over-week trend */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>This week vs last week</Text>

        <View style={styles.trendRow}>
          <View>
            <Text style={styles.trendNumber}>{thisWeekTotal}</Text>
            <Text style={styles.trendLabel}>Counters updated this week</Text>
          </View>

          <View style={styles.trendChangeBlock}>
            <Text
              style={[
                styles.trendChangeText,
                isUp ? styles.trendUp : styles.trendDown,
              ]}
            >
              {isUp ? "↑" : "↓"} {Math.abs(change)} ({Math.abs(changePercent)}%)
            </Text>
            <Text style={styles.trendSubLabel}>vs last week</Text>
          </View>
        </View>

      </View>

     {/* Simple “insight” blurb */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Insight</Text>
        {dueCount === 0 && soonCount === 0 ? (
          <Text style={styles.insightText}>
            Everything looks{" "}
            <Text style={styles.insightHighlight}>on track</Text>. Keep
            checking in when things change.
          </Text>
        ) : (
          <Text style={styles.insightText}>
            You have{" "}
            <Text style={styles.insightHighlight}>{dueCount}</Text> due and{" "}
            <Text style={styles.insightHighlight}>{soonCount}</Text> due
            soon. Your most overdue counter is{" "}
            <Text style={styles.insightHighlight}>{topCounter}</Text>.
          </Text>
        )}
      </View>

            {/* Real activity from history (last 7 days) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your real activity (last 7 days)</Text>

        {history.loading ? (
          <Text style={styles.cardHint}>Loading…</Text>
        ) : history.totalThisWeek === 0 ? (
          <Text style={styles.cardHint}>
            No completions logged yet this week. Mark some counters as complete to see them here.
          </Text>
        ) : (
          <>
            <Text style={styles.insightText}>
              You completed{" "}
              <Text style={styles.insightHighlight}>{history.totalThisWeek}</Text>{" "}
              events over the last 7 days.
            </Text>

            <View style={{ marginTop: 12 }}>
              {history.byTitle.map((row) => (
                <View
                  key={row.title}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    style={{ color: "#e5e7eb", fontSize: 13, flex: 1 }}
                    numberOfLines={1}
                  >
                    {row.title}
                  </Text>
                  <Text style={{ color: "#9ca3af", fontSize: 13, marginLeft: 12 }}>
                    {row.count}×
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#020617", // slate-950 vibe
    flexGrow: 1,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f9fafb",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#9ca3af",
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 12,
  },
  cardHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#6b7280",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    marginRight: 8,
  },
  statLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f9fafb",
  },
  statValueSmall: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f9fafb",
  },
  chartCard: {
    backgroundColor: "#020617",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 16,
    marginBottom: 16,
  },
  chartRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  donutOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 14,
    borderColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  donutInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
  },
  donutCenterValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f9fafb",
  },
  donutCenterLabel: {
    fontSize: 11,
    color: "#9ca3af",
  },
  legend: {
    flex: 1,
    justifyContent: "center",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendTextBlock: {
    flexShrink: 1,
  },
  legendLabel: {
    fontSize: 13,
    color: "#e5e7eb",
  },
  legendValue: {
    fontSize: 12,
    color: "#9ca3af",
  },
  trendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  trendNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#f9fafb",
  },
  trendLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  trendChangeBlock: {
    alignItems: "flex-end",
  },
  trendChangeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  trendUp: {
    color: "#10b981", // emerald
  },
  trendDown: {
    color: "#f97316", // orange-ish
  },
  trendSubLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  insightText: {
    fontSize: 13,
    color: "#d1d5db",
    lineHeight: 18,
  },
  insightHighlight: {
    fontWeight: "600",
    color: "#fbbf24",
  },
});
