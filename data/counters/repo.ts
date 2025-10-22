// data/counters.repo.ts
export type Counter = {
  id: string
  title: string
  emoji?: string | null
  lastAt: number
  targetDays?: number | null
}

export interface CountersRepo {
  all(): Promise<Counter[]>
  add(input: Omit<Counter, 'id'> & { id?: string }): Promise<Counter>
  reset(id: string, ts?: number): Promise<void>
  remove(id: string): Promise<void>
  seedIfEmpty(seed: Counter[]): Promise<void>
}
