import { useEffect, useState } from "react";
import { MS_DAY } from "../utils/date";
import { loadHistory, CounterHistoryEntry } from "../utils/history";
import { historyRepo, type HistoryEvent } from '../data'



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
        const allEntries: CounterHistoryEntry[] = await loadHistory();

        const now = Date.now();
        const cutoff = now - 7 * MS_DAY; // last 7 days

        const countsByTitle: Record<string, number> = {};
        let total = 0;

        for (const entry of allEntries) {
          // history.ts uses an ISO timestamp string
          const atMs = new Date(entry.timestamp).getTime();
          if (Number.isNaN(atMs)) continue;
          if (atMs < cutoff) continue;

          const title = entry.label?.trim() || "Untitled";
          countsByTitle[title] = (countsByTitle[title] ?? 0) + 1;
          total += 1;
        }

        const byTitle = Object.entries(countsByTitle)
          .map(([title, count]) => ({ title, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        if (!cancelled) {
          setState({
            loading: false,
            totalThisWeek: total,
            byTitle,
          });
        }

      } catch (e) {
        console.error("Failed to read history.events", e);
        if (!cancelled) {
          setState({
            loading: false,
            totalThisWeek: 0,
            byTitle: [],
          });
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
