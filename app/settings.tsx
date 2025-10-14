import { View, Text } from 'react-native'

export default function Settings() {
    return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0C', padding: 16 }}>
      <Text style={{ color: 'white', fontSize: 20, fontWeight: '600' }}>
        Settings
      </Text>
      {/* Later: export/import JSON, themes, etc. */}
    </View>
    )
}