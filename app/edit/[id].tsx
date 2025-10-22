import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { theme } from '../../utils/theme'
import { countersRepo, type Counter } from '../../data'

export default function EditCounter() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const nav = useRouter()
  const [item, setItem] = useState<Counter | undefined>()
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('')
  const [target, setTarget] = useState('')

  useEffect(() => {
    if (!id) return
    countersRepo.get!(id).then(c => {
      setItem(c)
      if (c) {
        setTitle(c.title)
        setEmoji(c.emoji ?? '')
        setTarget(c.targetDays != null ? String(c.targetDays) : '')
      }
    })
  }, [id])

  if (!item) {
    return (
      <View style={{ flex:1, backgroundColor: theme.bg, alignItems:'center', justifyContent:'center' }}>
        <Text style={{ color: theme.text }}>Loading…</Text>
      </View>
    )
  }

  const canSave = title.trim().length > 0

  return (
    <View style={{ flex:1, backgroundColor: theme.bg, padding: theme.pad }}>
      <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
        Edit Counter
      </Text>

      <TextInput
        placeholder="Title"
        placeholderTextColor="#666"
        value={title}
        onChangeText={setTitle}
        style={{ color: theme.text, backgroundColor: theme.card, borderColor: theme.border,
                 borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Emoji"
        placeholderTextColor="#666"
        value={emoji}
        onChangeText={setEmoji}
        style={{ color: theme.text, backgroundColor: theme.card, borderColor: theme.border,
                 borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Target days"
        placeholderTextColor="#666"
        keyboardType="numeric"
        value={target}
        onChangeText={setTarget}
        style={{ color: theme.text, backgroundColor: theme.card, borderColor: theme.border,
                 borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 }}
      />

      <Pressable
        disabled={!canSave}
        onPress={async () => {
          await countersRepo.update!(item.id, {
            title: title.trim(),
            emoji: emoji.trim() || null,
            targetDays: target ? parseInt(target, 10) : null,
          })
          nav.back()
        }}
        style={{
          opacity: canSave ? 1 : 0.5,
          backgroundColor: theme.primary,
          borderRadius: 10,
          padding: 14,
          alignItems: 'center',
          marginBottom: 12
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          Alert.alert('Delete counter?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete', style: 'destructive', onPress: async () => {
                await countersRepo.remove(item.id)
                nav.replace('/')
              }
            }
          ])
        }}
        style={{
          backgroundColor: '#372527',
          borderColor: '#4E1F25',
          borderWidth: 1,
          borderRadius: 10,
          padding: 14,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: '#FF6B6B', fontWeight: '700' }}>Delete</Text>
      </Pressable>
    </View>
  )
}
