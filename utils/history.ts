import AsyncStorage from "@react-native-async-storage/async-storage";

export const HISTORY_STORAGE_KEY = "countly:history:v1";

export type HistoryEventType =
  | "increment"
  | "decrement"
  | "set"
  | "reset"
  | "completed";

export interface CounterHistoryEntry {
  id: string;          // counter id
  label?: string;      // optional, snapshot of the name at the time
  valueAfter: number;  // value after the change
  delta: number;       // +1, -1, or difference
  type: HistoryEventType;
  timestamp: string;   // ISO string for easier grouping later
}

/**
 * Load all history entries from storage.
 */
export async function loadHistory(): Promise<CounterHistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CounterHistoryEntry[];
  } catch (e) {
    console.warn("[History] Failed to load history", e);
    return [];
  }
}

/**
 * Save a full history array back to storage.
 * Mostly useful for future features like pruning.
 */
export async function saveHistory(
  entries: CounterHistoryEntry[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(entries)
    );
  } catch (e) {
    console.warn("[History] Failed to save history", e);
  }
}

/**
 * Append a single entry to existing history.
 */
export async function appendHistoryEntry(
  entry: CounterHistoryEntry
): Promise<void> {
  try {
    const existing = await loadHistory();
    const updated = [...existing, entry];
    await saveHistory(updated);
  } catch (e) {
    console.warn("[History] Failed to append history entry", e);
  }
}

/**
 * Optional helper: clear all history.
 * (Useful for debugging or a future "Reset Insights" button.)
 */
export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (e) {
    console.warn("[History] Failed to clear history", e);
  }
}
