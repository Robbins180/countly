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
  /** If provided, this overrides computed overdue UI */
  status?: 'due' | 'soon' | "completed"
  overdueColors?: OverdueColors
  mutedColor?: string
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
  status,
}: Props) {
  const isTargetFinite =
    typeof targetDays === 'number' && Number.isFinite(targetDays)

  // existing computed overdue
  const computedOverdue = isTargetFinite ? days > (targetDays as number) : false

  // unify status: explicit beats computed
  const effectiveStatus: 'due' | 'soon' | null =
    status ?? (computedOverdue ? 'due' : null)

  // colors
  const FALLBACK_DUE: OverdueColors = {
    border: '#4E1F25',
    bg: '#372527',
    text: '#FF6B6B',
  }
  const SOON: OverdueColors = {
    border: '#5a4f1f',
    bg: '#2c2a1c',
    text: '#F3E38A',
  }
  const COMPLETE: OverdueColors = {
  border: '#2d5430',
  bg: '#233224',
  text: '#9DFFB0',
};


  const OD = overdueColors ?? FALLBACK_DUE
  const MUTED = mutedColor ?? '#9aa0a6'

  // pick palette by status
  const activeColors =
    effectiveStatus === 'due'
      ? OD
      : effectiveStatus === 'soon'
      ? SOON
      : effectiveStatus === 'complete'
      ? COMPLETE
      : null;


  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
      style={{
        position: 'relative',
        flex: 1,
        minHeight: 120,
        backgroundColor: theme.card,
        borderColor: activeColors ? activeColors.border : theme.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        justifyContent: 'space-between',

        // subtle glow/shadow only for DUE (keep your original behavior)
        shadowColor:
          effectiveStatus === 'due'
            ? OD.text
            : effectiveStatus === 'complete'
            ? COMPLETE.text
            : 'transparent',
        shadowOpacity:
          effectiveStatus === 'due' || effectiveStatus === 'complete' ? 0.25 : 0,
        shadowRadius:
          effectiveStatus === 'due' || effectiveStatus === 'complete' ? 10 : 0,
        shadowOffset:
          effectiveStatus === 'due' || effectiveStatus === 'complete'
            ? { width: 0, height: 6 }
            : { width: 0, height: 0 },
        elevation: effectiveStatus === 'due' || effectiveStatus === 'complete' ? 5 : 0,

      }}
    >
      {effectiveStatus && (
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 999,
            backgroundColor: activeColors!.bg,
            borderWidth: 1,
            borderColor: activeColors!.text,
          }}
        >
          <Text
            style={{
              color: activeColors!.text,
              fontSize: 11,
              fontWeight: '800',
              letterSpacing: 0.3,
            }}
          >
             {effectiveStatus === 'due'
              ? 'DUE'
              : effectiveStatus === 'soon'
              ? 'DUE SOON'
              : 'COMPLETE'}
          </Text>
        </View>
      )}

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
              borderColor: activeColors ? activeColors.text : theme.border,
              backgroundColor: effectiveStatus ? activeColors!.bg : 'transparent',
            }}
          >
            <Text
              style={{
                color: activeColors ? activeColors.text : MUTED,
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
