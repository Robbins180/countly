import { View, Text, Pressable } from 'react-native'
import { Link } from 'expo-router'

export default function Home() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0C', padding: 16 }}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: '600', marginBottom: 8 }}>
        Countly
      </Text>

      {/* Quick link to Settings to verify routing */}
      <Link href="/settings">
        <Text style={{ color: '#9AA0A6', marginBottom: 16 }}>Settings</Text>
      </Link>

      {/* Placeholder content area */}
      <View style={{ flex: 1, borderWidth: 1, borderColor: '#222', borderRadius: 12 }} />

      {/* Floating + button → Add screen */}
      <Link href="/add" asChild>
        <Pressable
          style={{
            position: 'absolute',
            right: 16,
            bottom: 24,
            height: 56,
            width: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#5B8CFF',
            elevation: 6,
          }}
        >
          <Text style={{ color: 'white', fontSize: 28, marginTop: -2 }}>＋</Text>
        </Pressable>
      </Link>
    </View>
  )
}
