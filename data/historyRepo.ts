// data/historyRepo.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MS_DAY } from '../utils/date'

export type HistoryAction = 'complete'

export interface HistoryEvent {
  id: string
  counterId: string
  title: string
  emoji: string | null
  timestamp: number
  action: HistoryAction
}

// Single key for now – simplest possible shape
const STORAGE_KEY = 'history:v1'

// --- internal helpers ---

async function loadAll(): Promise<HistoryEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as HistoryEvent[]
  } catch (e) {
    console.error('historyRepo.loadAll failed', e)
    return []
  }
}

async function saveAll(events: HistoryEvent[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  } catch (e) {
    console.error('historyRepo.saveAll failed', e)
  }
}

// --- public API ---

function makeId() {
  return `h-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Add a new history event.
 * You can optionally pass a custom id; otherwise one is generated.
 */
async function add(
  input: Omit<HistoryEvent, 'id'> & { id?: string }
): Promise<HistoryEvent> {
  const id = input.id ?? makeId()
  const event: HistoryEvent = { ...input, id }

  const all = await loadAll()
  // newest first
  const next = [event, ...all]
  await saveAll(next)

  return event
}

/** Return all events, newest first. */
async function all(): Promise<HistoryEvent[]> {
  const events = await loadAll()
  // just in case the stored array is unsorted
  return [...events].sort((a, b) => b.timestamp - a.timestamp)
}

/** Remove all history events (debug / dev only). */
async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('historyRepo.clearAll failed', e)
  }
}

/** Get events since a specific timestamp (ms). */
async function recentSince(sinceMs: number): Promise<HistoryEvent[]> {
  const events = await loadAll()
  return events
    .filter((e) => e.timestamp >= sinceMs)
    .sort((a, b) => b.timestamp - a.timestamp)
}

/** Get events from the last N days. */
async function recentDays(days: number): Promise<HistoryEvent[]> {
  const cutoff = Date.now() - days * MS_DAY
  return recentSince(cutoff)
}

export const historyRepo = {
  add,
  all,
  clearAll,
  recentSince,
  recentDays,
}
