// components/CounterCard.tsx
import React from 'react'
import { Pressable, View, Text } from 'react-native'
import { theme } from '../utils/theme'

type OverdueColors = { border: string; bg: string; text: string }

type Props = {
  title: string
  emoji?: string
  days: number
  targetDays?: number | null
  onPress?: () => void
  onLongPress?: () => void

  // OPTIONAL styling hooks (use your existing statusColors if you have them)
  overdueColors?: OverdueColors        // e.g., { border: '#...', bg: '#...', text: '#...' }
  mutedColor?: string                  // e.g., statusColors.muted
}

export function CounterCard({
  title,
  emoji,
  days,
  targetDays,
  onPress,
  onLongPress,
  overdueColors,
  mutedColor,
}: Props) {
  const isTargetFinite =
    typeof targetDays === 'number' && Number.isFinite(targetDays)

  const overdue = isTargetFinite ? days > (targetDays as number) : false

  // Fallbacks if you don't pass custom colors
  const fallbackOverdue: OverdueColors = {
    border: '#4E1F25',
    bg: '#372527',
    text: '#FF6B6B',
  }
  const MUTED = mutedColor ?? '#9aa0a6'
  const OD = overdueColors ?? fallbackOverdue

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
      style={{
        flex: 1,
        minHeight: 120,
        backgroundColor: theme.card,
        borderColor: overdue ? OD.border : theme.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {emoji ? (
          <Text style={{ fontSize: 20 }}>{emoji}</Text>
        ) : (
          <Text style={{ fontSize: 20, opacity: 0.5 }}>🏷️</Text>
        )}
        <Text
          numberOfLines={1}
          style={{ color: theme.text, fontSize: 16, fontWeight: '700', flexShrink: 1 }}
        >
          {title}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View>
          <Text style={{ color: theme.text, fontSize: 32, fontWeight: '800' }}>{days}</Text>
          <Text style={{ color: MUTED, fontSize: 12, marginTop: -4 }}>days</Text>
        </View>

        {isTargetFinite ? (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: overdue ? OD.text : theme.border,
              backgroundColor: overdue ? OD.bg : 'transparent',
            }}
          >
            <Text
              style={{
                color: overdue ? OD.text : MUTED,
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              target {targetDays}
            </Text>
          </View>
        ) : (
          <Text style={{ color: MUTED, fontSize: 12 }}>no target</Text>
        )}
      </View>
    </Pressable>
  )
}
