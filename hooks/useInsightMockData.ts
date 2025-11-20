import { useEffect, useMemo, useState } from "react";
import { countersRepo, type Counter } from "../data";
import { daysSince } from "../utils/date";

export interface InsightSegment {
  label: string;
  value: number;
  color: string;
}

export interface WeeklyInsights {
  total: number;          // total counters
  activeDays: number;     // counters touched within last 7 days
  topCounter: string;     // most overdue
  lastWeekTotal: number;  // counters updated 8–14 days ago
  thisWeekTotal: number;  // counters updated 0–7 days ago
  segments: InsightSegment[];
  change: number;
  changePercent: number;
  isUp: boolean;
}

// Our internal status buckets for segmentation
type ItemStatus = "due" | "soon" | "ok" | "noTarget";

const SOON_THRESHOLD_DAYS = 3;

const useInsightMockData = (): WeeklyInsights => {
  const [counters, setCounters] = useState<Counter[]>([]);

  // Load all counters once when the Insights screen mounts
  useEffect(() => {
    countersRepo
      .all()
      .then(setCounters)
      .catch((err) => {
        console.error("Failed to load counters for insights", err);
        setCounters([]);
      });
  }, []);

  return useMemo(() => {
    if (!counters.length) {
      // Graceful empty state: everything is zero
      return {
        total: 0,
        activeDays: 0,
        topCounter: "—",
        lastWeekTotal: 0,
        thisWeekTotal: 0,
        segments: [],
        change: 0,
        changePercent: 0,
        isUp: false,
      };
    }

    // Enrich counters with days-since and status
    const enriched = counters.map((c) => {
      const days = daysSince(c.lastAt);
      let status: ItemStatus = "noTarget";

      if (c.targetDays != null) {
        const delta = c.targetDays - days;
        if (delta <= 0) status = "due";
        else if (delta <= SOON_THRESHOLD_DAYS) status = "soon";
        else status = "ok";
      }

      return { ...c, days, status };
    });

    const totalCounters = enriched.length;

    // “This week” = last 7 days, “last week” = 8–14 days ago
    const thisWeekTotal = enriched.filter((c) => c.days <= 7).length;
    const lastWeekTotal = enriched.filter(
      (c) => c.days > 7 && c.days <= 14
    ).length;

    // We’ll keep activeDays equal to thisWeekTotal for now
    const activeDays = thisWeekTotal;

    const dueCount = enriched.filter((c) => c.status === "due").length;
    const soonCount = enriched.filter((c) => c.status === "soon").length;
    const okCount = enriched.filter((c) => c.status === "ok").length;
    const noTargetCount = enriched.filter(
      (c) => c.status === "noTarget"
    ).length;

    const segments: InsightSegment[] = [
      { label: "Due", value: dueCount, color: "#ef4444" }, // red
      { label: "Due soon", value: soonCount, color: "#f59e0b" }, // amber
      { label: "On track", value: okCount, color: "#10b981" }, // emerald
      { label: "No target", value: noTargetCount, color: "#6b7280" }, // gray
    ].filter((seg) => seg.value > 0);

    // Top counter: most overdue one (largest "over target" amount)
    let topCounter = "—";
    const overdueSorted = enriched
      .filter((c) => c.targetDays != null)
      .map((c) => {
        const overBy = c.days - (c.targetDays ?? 0);
        return { c, overBy };
      })
      .sort((a, b) => b.overBy - a.overBy);

    if (overdueSorted[0]) {
      topCounter = overdueSorted[0].c.title;
    }

    const change = thisWeekTotal - lastWeekTotal;
    const changePercent =
      lastWeekTotal > 0 ? Math.round((change / lastWeekTotal) * 100) : 0;
    const isUp = change >= 0;

    return {
      total: totalCounters,
      activeDays,
      topCounter,
      lastWeekTotal,
      thisWeekTotal,
      segments,
      change,
      changePercent,
      isUp,
    };
  }, [counters]);
};

export default useInsightMockData;
export { useInsightMockData };
