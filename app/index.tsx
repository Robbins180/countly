import { useMemo } from 'react'
import { View, FlatList } from 'react-native'
import { Link } from 'expo-router'
import { Header } from '../components/Header'
import { FAB } from '../components/FAB'
import { CounterCard } from '../components/CounterCard'
import { theme } from '../utils/theme'
import { daysSince } from '../utils/date'

// temporary mock data until DB (Day 3)
const mock = [
  { id: '1', title: 'Haircut', emoji: '💇', lastAt: Date.now() - 23 * 86_400_000, targetDays: 30 },
  { id: '2', title: 'Oil Change', emoji: '🛢️', lastAt: Date.now() - 91 * 86_400_000, targetDays: 180 },
  { id: '3', title: 'No Takeout', emoji: '🥗', lastAt: Date.now() - 12 * 86_400_000, targetDays: 999 },
  { id: '4', title: 'Car Wash', emoji: '🚗', lastAt: Date.now() - 15 * 86_400_000, targetDays: 21 },
  { id: '5', title: 'Date Night', emoji: '🍷', lastAt: Date.now() - 8 * 86_400_000, targetDays: 7 },
]

export default function Home() {
  const data = useMemo(
    () => mock.map(m => ({ ...m, days: daysSince(m.lastAt) })),
    []
  )

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
            emoji={item.emoji}
            days={item.days}
            targetDays={item.targetDays}
            onPress={() => {/* later: reset action */}}
          />
        )}
      />

      <Link href="/add" asChild>
        <FAB onPress={() => {}} />
      </Link>
    </View>
  )
}
