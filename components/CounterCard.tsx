import { View, Text, Pressable } from 'react-native'
import { theme } from '../utils/theme'
import { getStatus, Status } from '../utils/status'

type Props = {
  title: string
  emoji?: string
  days: number
  targetDays?: number
  onPress?: () => void
}

const statusColors: Record<Status, { border: string; text: string }> = {
  ok:   { border: '#1F2A44', text: theme.subtext },
  near: { border: '#6B5B00', text: '#E6C200' },
  due:  { border: '#4E1F25', text: '#FF6B6B' },
}

export function CounterCard({ title, emoji = '🧮', days, targetDays, onPress }: Props) {
  const status = getStatus(days, targetDays)
  const colors = statusColors[status]

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: theme.card,
        borderRadius: theme.radius * 1.2,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        gap: 6,
        transform: [{ scale: pressed ? 0.98 : 1 }],
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 6 },
        elevation: 5,
      })}
    >
      <Text style={{ fontSize: 20, marginBottom: 2 }}>
        {emoji} <Text style={{ color: theme.text, fontWeight: '700' }}>{title}</Text>
      </Text>

      <Text style={{ color: colors.text }}>
        <Text style={{ color: theme.text, fontWeight: '700' }}>{days}</Text> day{days === 1 ? '' : 's'} since
      </Text>

      {typeof targetDays === 'number' && (
        <View style={{
          marginTop: 2, alignSelf: 'flex-start',
          paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
          backgroundColor: colors.border,
        }}>
          <Text style={{ color: colors.text, fontSize: 12 }}>
            Target: {targetDays}d
          </Text>
        </View>
      )}
    </Pressable>
  )
}
