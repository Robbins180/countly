import { useRouter } from 'expo-router'
  const nav = useRouter() // move this to better spot after bugs are gone
import { useEffect, useState } from 'react'
import { View, FlatList, Modal, Text, TextInput, Pressable, Alert } from 'react-native'
import { Link } from 'expo-router'
import { Header } from '../components/Header'
import { FAB } from '../components/FAB'
import { CounterCard } from '../components/CounterCard'
import { theme } from '../utils/theme'
import { MS_DAY, daysSince } from '../utils/date'
import AsyncStorage from '@react-native-async-storage/async-storage'

// NEW: the storage repo (AsyncStorage-backed)
import { countersRepo, type Counter } from '../data'

export default function Home() {
  // holds persisted counters
  const [items, setItems] = useState<Counter[]>([])
  const [editing, setEditing] = useState<Counter | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editEmoji, setEditEmoji] = useState('')
  const [editTarget, setEditTarget] = useState('')

    // State to sort the mode
  const [sortMode, setSortMode] =useState<'name' | 'due'>('name')

    const GUTTER = 12
  const contentPad = theme.pad

  const SORT_KEY = 'ui.sortMode' // stable key for this screen

  // Holds Current search string
  const [filterText, setFilterText] = useState('')


////////////////////////////////////////////// functions //////////////////////////////////////
  
// Start of Edit Functions 
  function startEdit(item: Counter) {
  setEditing(item)
  setEditTitle(item.title)
  setEditEmoji(item.emoji ?? '')
  setEditTarget(item.targetDays != null ? String(item.targetDays) : '')
}

async function saveEdit() {
  if (!editing) return
  await countersRepo.update(editing.id, {
    title: editTitle.trim(),
    emoji: editEmoji.trim() || null,
    targetDays: editTarget ? parseInt(editTarget, 10) : null,
  })
  setEditing(null)
  reload()
}

async function deleteItem() {
  if (!editing) return
  await countersRepo.remove(editing.id)
  setEditing(null)
  reload()
}
// end of helpers

  // refresh helper
  const reload = () => {
    countersRepo.all().then(setItems).catch(console.error)
  }
 

  // seed on first run, then load
  useEffect(() => {
    countersRepo
      .seedIfEmpty([
        { id: 'seed-1', title: 'Haircut', emoji: '💇', lastAt: Date.now() - 23 * MS_DAY, targetDays: 30 },
        { id: 'seed-2', title: 'Oil Change', emoji: '🛢️', lastAt: Date.now() - 91 * MS_DAY, targetDays: 180 },
      ])
      .finally(reload)
  }, [])

  // Replace your current data derivation with this version that filters by title (case-insensitive) before sorting
    const normalizedFilter = filterText.trim().toLowerCase()
    const data = items
      .filter(m => !normalizedFilter || m.title.toLowerCase().includes(normalizedFilter))
      .map(m => ({ ...m, days: daysSince(m.lastAt) }))
      .sort((a, b) => {
        if (sortMode === 'name') return a.title.localeCompare(b.title)
        const aDelta = a.targetDays != null ? a.targetDays - a.days : Infinity
        const bDelta = b.targetDays != null ? b.targetDays - b.days : Infinity
        return aDelta - bDelta
      })




  
  // Reads previously saved sort mode on first render
  useEffect(() => {
    AsyncStorage.getItem(SORT_KEY).then((v) => {
      if (v === 'name' || v === 'due') setSortMode(v)
    }).catch(console.error)
  }, [])

  // Writes current mode whenever the user toggles it
  useEffect(() => {
    AsyncStorage.setItem(SORT_KEY, sortMode).catch(console.error)
  }, [sortMode])



  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header />

        <View style={{ paddingHorizontal: theme.pad, paddingTop: 8, paddingBottom: 6 }}>
          <TextInput
            value={filterText}
            onChangeText={setFilterText}
            placeholder="Search counters…"
            placeholderTextColor="#666"
            style={{
              color: theme.text,
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderWidth: 1,
              borderRadius: 10,
              paddingVertical: 10,
              paddingHorizontal: 12,
            }}
          />
        </View>


        <View style={{ paddingHorizontal: theme.pad, paddingTop: 8, paddingBottom: 6, flexDirection: 'row', gap: 8 }}>
          <Text style={{ color: theme.text, opacity: 0.7, marginRight: 6 }}>Sort:</Text>

          <Pressable
            onPress={() => setSortMode('name')}
            style={{
              paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999,
              borderWidth: 1, borderColor: sortMode === 'name' ? theme.primary : theme.border,
              backgroundColor: sortMode === 'name' ? '#1d263b' : 'transparent'
            }}
          >
            <Text style={{ color: sortMode === 'name' ? theme.primary : theme.text }}>Name</Text>
          </Pressable>

          <Pressable
            onPress={() => setSortMode('due')}
            style={{
              paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999,
              borderWidth: 1, borderColor: sortMode === 'due' ? theme.primary : theme.border,
              backgroundColor: sortMode === 'due' ? '#1d263b' : 'transparent'
            }}
          >
            <Text style={{ color: sortMode === 'due' ? theme.primary : theme.text }}>Due soon</Text>
          </Pressable>
        </View>


              {data.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.pad }}>
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
            No counters yet
          </Text>
          <Text style={{ color: '#9aa0a6', textAlign: 'center', lineHeight: 20, marginBottom: 12 }}>
            Tap the + button to add your first counter.
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(it) => it.id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: theme.pad, paddingBottom: 96, gap: 12 }}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <CounterCard
              title={item.title}
              emoji={item.emoji ?? undefined}
              days={item.days}
              targetDays={item.targetDays ?? undefined}
              // Adds Alert to show Yes/No dialog before resseting
              onPress={() => { 
                Alert.alert(
                  'Reset days?',
                  `This will set “${item.title}” to 0 days.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Reset',
                      style: 'destructive',
                      onPress: async () => {
                        await countersRepo.reset(item.id)
                        reload()
                      }
                    }
                  ]
                )
              }}

              // onLongPress={() => startEdit(item)}  {/* keep your long-press handler if you added inline edit */}
            />
          )}
        />
      )}


     

      <Link href="/add" asChild>
        <FAB onPress={() => {}} />
      </Link>
      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <View style={{ flex:1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems:'center', justifyContent:'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 440, backgroundColor: theme.card, borderColor: theme.border, borderWidth:1, borderRadius: 12, padding: 16 }}>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Edit Counter</Text>

            <Text style={{ color: theme.text, marginBottom: 6 }}>Title</Text>
            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Title"
              placeholderTextColor="#666"
              style={{ color: theme.text, backgroundColor: theme.bg, borderColor: theme.border, borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 }}
            />

            <Text style={{ color: theme.text, marginBottom: 6 }}>Emoji</Text>
            <TextInput
              value={editEmoji}
              onChangeText={setEditEmoji}
              placeholder="e.g. 💇"
              placeholderTextColor="#666"
              style={{ color: theme.text, backgroundColor: theme.bg, borderColor: theme.border, borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 }}
            />

            <Text style={{ color: theme.text, marginBottom: 6 }}>Target days</Text>
            <TextInput
              value={editTarget}
              onChangeText={setEditTarget}
              keyboardType="numeric"
              placeholder="e.g. 30"
              placeholderTextColor="#666"
              style={{ color: theme.text, backgroundColor: theme.bg, borderColor: theme.border, borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 16 }}
            />

            <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
              <Pressable onPress={() => setEditing(null)} style={{ paddingVertical: 12, paddingHorizontal: 14 }}>
                <Text style={{ color: '#aaa' }}>Cancel</Text>
              </Pressable>

              <Pressable onPress={deleteItem} style={{ backgroundColor: '#372527', borderColor: '#4E1F25', borderWidth: 1, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16 }}>
                <Text style={{ color: '#FF6B6B', fontWeight: '700' }}>Delete</Text>
              </Pressable>

              <Pressable
                disabled={!editTitle.trim()}
                onPress={saveEdit}
                style={{ opacity: editTitle.trim() ? 1 : 0.5, backgroundColor: theme.primary, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16 }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

