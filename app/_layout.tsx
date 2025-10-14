import { Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '..utils/theme'

export default function RootLayout() {
    return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B0C' }}>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
    )
}
