// data/counters.repo.async.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Counter, CountersRepo } from './counters.repo'

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
    const item: Counter = { id: input.id ?? newId(), ...input }
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
  }
}
