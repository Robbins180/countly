import { useEffect, useState } from "react";
import { MS_DAY } from "../utils/date";
import { historyRepo } from "../data";

export interface HistoryThisWeek {
  loading: boolean;
  totalThisWeek: number;
  byTitle: { title: string; count: number }[];
}

export function useHistoryThisWeek(): HistoryThisWeek {
  const [state, setState] = useState<HistoryThisWeek>({
    loading: true,
    totalThisWeek: 0,
    byTitle: [],
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const events = await historyRepo.recentDays(7);

        const countsByTitle: Record<string, number> = {};
        let total = 0;

        for (const event of events) {
          const title = event.title?.trim() || "Untitled";
          countsByTitle[title] = (countsByTitle[title] ?? 0) + 1;
          total += 1;
        }

        const byTitle = Object.entries(countsByTitle)
          .map(([title, count]) => ({ title, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        if (!cancelled) {
          setState({ loading: false, totalThisWeek: total, byTitle });
        }
      } catch (e) {
        console.error("useHistoryThisWeek failed", e);
        if (!cancelled) {
          setState({ loading: false, totalThisWeek: 0, byTitle: [] });
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return state;
}