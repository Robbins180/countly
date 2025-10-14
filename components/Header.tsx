import { View, Text, Pressable } from 'react-native'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../utils/theme'

export function Header({ title = 'Countly' }: { title?: string }) {
  return (
    <View style={{ paddingHorizontal: theme.pad, paddingTop: theme.pad, paddingBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: theme.text, fontSize: 24, fontWeight: '700' }}>{title}</Text>
        <Link href="/settings" asChild>
          <Pressable
            style={{
              height: 36, width: 36, borderRadius: 18,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border,
            }}
          >
            <Ionicons name="settings-outline" size={18} color={theme.subtext} />
          </Pressable>
        </Link>
      </View>
    </View>
  )
}
