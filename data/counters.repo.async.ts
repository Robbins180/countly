// data/counters.repo.async.ts
import AsyncStorage from '@react-native-async-storage/async-storage'

// Inlined types (no separate counters.repo.ts needed)
export type Counter = {
  id: string
  title: string
  emoji?: string | null
  lastAt: number
  targetDays?: number | null
  archived?: boolean         // ← new optional flag
}

export type CountersRepo = {
  all(): Promise<Counter[]>
  add(input: Omit<Counter, 'id'> & { id?: string }): Promise<Counter>
  reset(id: string, ts?: number): Promise<void>
  remove(id: string): Promise<void>
  seedIfEmpty(seed: Counter[]): Promise<void>
  get(id: string): Promise<Counter | undefined>
  update(id: string, patch: Partial<Omit<Counter, 'id'>>): Promise<void>
  // new
  archive(id: string): Promise<void>
  unarchive(id: string): Promise<void>
}


const KEY = 'counters:v1'

const newId = () =>
  typeof crypto?.randomUUID === 'function'
    ? crypto.randomUUID()
    : 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)

async function load(): Promise<Counter[]> {
  const raw = await AsyncStorage.getItem(KEY)
  return raw ? (JSON.parse(raw) as Counter[]) : []
}

async function save(list: Counter[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(list))
}

export const countersRepoAsync: CountersRepo = {
  async all() {
    const list = await load()
    return list.sort((a, b) => a.title.localeCompare(b.title))
  },
 
    async add(input) {
      const list = await load()
      const item: Counter = {
      id: input.id ?? newId(),
      title: input.title,
      emoji: input.emoji ?? null,
      lastAt: input.lastAt,
      targetDays: input.targetDays ?? null,
      archived: input.archived ?? false,   // default false
        }
      list.push(item)
      await save(list)
      return item
    },


  async reset(id, ts = Date.now()) {
    const list = await load()
    const i = list.findIndex(x => x.id === id)
    if (i >= 0) {
      list[i] = { ...list[i], lastAt: ts }
      await save(list)
    }
  },
  async remove(id) {
    const list = await load()
    await save(list.filter(x => x.id !== id))
  },
  async seedIfEmpty(seed) {
    const list = await load()
    if (list.length === 0) await save(seed)
  },
  async get(id) {
    const list = await load()
    return list.find(x => x.id === id)
  },
  async update(id, patch) {
    const list = await load()
    const i = list.findIndex(x => x.id === id)
    if (i >= 0) {
      list[i] = { ...list[i], ...patch}
      await save(list)
    }
  },

    // archiving section 
    async archive(id) {
    const list = await load()
    const i = list.findIndex(x => x.id === id)
    if (i >= 0) {
      list[i] = { ...list[i], archived: true }
      await save(list)
    }
  },

  async unarchive(id) {
    const list = await load()
    const i = list.findIndex(x => x.id === id)
    if (i >= 0) {
      list[i] = { ...list[i], archived: false }
      await save(list)
    }
  }

}
