import { useEffect, useState } from 'react'
import { View, FlatList } from 'react-native'
import { Link } from 'expo-router'
import { Header } from '../components/Header'
import { FAB } from '../components/FAB'
import { CounterCard } from '../components/CounterCard'
import { theme } from '../utils/theme'
import { MS_DAY, daysSince } from '../utils/date'

// NEW: the storage repo (AsyncStorage-backed)
import { countersRepo, type Counter } from '../data'

export default function Home() {
  // holds persisted counters
  const [items, setItems] = useState<Counter[]>([])

  // refresh helper
  const reload = () => {
    countersRepo.all().then(setItems).catch(console.error)
  }

  // seed on first run, then load
  useEffect(() => {
    countersRepo
      .seedIfEmpty([
        { id: 'seed-1', title: 'Haircut', emoji: '💇', lastAt: Date.now() - 23 * MS_DAY, targetDays: 30 },
        { id: 'seed-2', title: 'Oil Change', emoji: '🛢️', lastAt: Date.now() - 91 * MS_DAY, targetDays: 180 },
      ])
      .finally(reload)
  }, [])

  // derive display-only "days" value
  const data = items.map(m => ({ ...m, days: daysSince(m.lastAt) }))

  const GUTTER = 12
  const contentPad = theme.pad

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header />

      <FlatList
        data={data}
        keyExtractor={(it) => it.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: contentPad, paddingBottom: 96, gap: GUTTER }}
        columnWrapperStyle={{ gap: GUTTER }}
        renderItem={({ item }) => (
          <CounterCard
            title={item.title}
            emoji={item.emoji ?? undefined}
            days={item.days}
            targetDays={item.targetDays ?? undefined}
            // tap to reset "lastAt" and refresh
            onPress={async () => { await countersRepo.reset(item.id); reload() }}
          />
        )}
      />

      <Link href="/add" asChild>
        <FAB onPress={() => {}} />
      </Link>
    </View>
  )
}

