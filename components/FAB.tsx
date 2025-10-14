import { Pressable, Text } from 'react-native'
import * as Haptics from 'expo-haptics'
import { theme } from '../utils/theme'

export function FAB({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={async () => {
        try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) } catch {}
        onPress()
      }}
      style={({ pressed }) => ({
        position: 'absolute',
        right: theme.pad, bottom: theme.pad + 8,
        height: 56, width: 56, borderRadius: 28,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: theme.primary,
        opacity: pressed ? 0.9 : 1,
        shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 6 },
        elevation: 6,
      })}
    >
      <Text style={{ color: '#fff', fontSize: 28, marginTop: -2 }}>＋</Text>
    </Pressable>
  )
}
