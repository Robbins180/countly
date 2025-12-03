import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MS_DAY } from "../utils/date";

type CounterEventType = "completed";

type CounterEvent = {
  id: string;
  counterId: string;
  at: number;
  type: CounterEventType;
  titleSnapshot: string;
};

const HISTORY_KEY = "history.events";

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
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        const list: CounterEvent[] = raw ? JSON.parse(raw) : [];

        const now = Date.now();
        const cutoff = now - 7 * MS_DAY; // last 7 days

        const countsByTitle: Record<string, number> = {};
        let total = 0;

        for (const evt of list) {
          if (evt.type !== "completed") continue;
          if (evt.at < cutoff) continue;

          const title = evt.titleSnapshot || "Untitled";
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
