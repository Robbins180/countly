import { useEffect, useState, useRef } from 'react'
import { View, FlatList, Modal, Text, TextInput, Pressable, Alert } from 'react-native'
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
  const [showArchived, setShowArchived] = useState(false)

  // ADD MODAL state
  const [adding, setAdding] = useState(false)
  const [addTitle, setAddTitle] = useState('')
  const [addEmoji, setAddEmoji] = useState('')
  const [addTarget, setAddTarget] = useState('')
  const [exportOpen, setExportOpen] = useState(false)

  const COMMON_EMOJIS = ['💇','🛢️','🚗','🍷','🥗','🏋️','📚','🧹','🧼','🛒','💊','🧑‍🍳','🪥','🧵','🧰','📦','🛏️','🔋','🔧','📞','💡']

  // State to sort the mode
  const [sortMode, setSortMode] = useState<'name' | 'due'>('name')

  const SORT_KEY = 'ui.sortMode'            // stable key for this screen
  const PREF_SHOW_ARCHIVED = 'ui.showArchived'
  const PREF_FILTER = 'ui.filterText'

  // Holds Current search string
  const [filterText, setFilterText] = useState('')

  // Toast Feedback after actions
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  ////////////////////////////////////////////// functions //////////////////////////////////////

  // Start of Edit Functions
  function startEdit(item: Counter) {
    setEditing(item)
    setEditTitle(item.title)
    setEditEmoji(item.emoji ?? '')
    setEditTarget(item.targetDays != null ? String(item.targetDays) : '')
  }

  // Toast function
  const showToast = (msg: string) => {
    setToast(msg)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 1600)
  }

  // Quick feedback after local message
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

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

  // create a new counter
  async function addNew() {
    if (!addTitle.trim()) return
    await countersRepo.add({
      title: addTitle.trim(),
      emoji: addEmoji.trim() ? addEmoji.trim() : null,
      targetDays: addTarget ? parseInt(addTarget, 10) : null,
      lastAt: Date.now(), // start at 0 days
    })
    setAdding(false)
    setAddTitle('')
    setAddEmoji('')
    setAddTarget('')
    reload()
    showToast('Added')
  }

  // Calls existing repo .add() to create a new counter from currently edited one, then refreshes the list and shows toast
  async function duplicateSelected() {
    if (!editing) return
    await countersRepo.add({
      title: editing.title + ' (copy)',
      emoji: editing.emoji ?? null,
      targetDays: editing.targetDays ?? null,
      lastAt: Date.now(),
    })
    setEditing(null)
    reload()
    showToast('Duplicated')
  }

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

  // data derivation (filter then sort)
  const normalizedFilter = filterText.trim().toLowerCase()

  const data = items
    .filter(m => (showArchived ? true : !m.archived))
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

  // Save prefs
  useEffect(() => {
    AsyncStorage.setItem(PREF_SHOW_ARCHIVED, showArchived ? '1' : '0').catch(console.error)
  }, [showArchived])

  // Load prefs
  useEffect(() => {
    AsyncStorage
      .multiGet([PREF_SHOW_ARCHIVED, PREF_FILTER])
      .then((entries) => {
        const map = Object.fromEntries(entries)
        if (map[PREF_SHOW_ARCHIVED] != null) {
          setShowArchived(map[PREF_SHOW_ARCHIVED] === '1')
        }
        if (map[PREF_FILTER] != null) {
          setFilterText(map[PREF_FILTER] as string)
        }
      })
      .catch(console.error)
  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header />

      {/* accent under header (fixed) */}
      <View style={{ height: 6, backgroundColor: theme.primary }} />
      <View style={{ height: 1, backgroundColor: '#ffffff22' }} />

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

        <Pressable
          onPress={() => setShowArchived(s => !s)}
          style={{
            marginLeft: 8,
            paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999,
            borderWidth: 1, borderColor: showArchived ? theme.primary : theme.border,
            backgroundColor: showArchived ? '#1d263b' : 'transparent'
          }}
        >
          <Text style={{ color: showArchived ? theme.primary : theme.text }}>
            {showArchived ? 'Showing archived' : 'Hide archived'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setExportOpen(true)}
          style={{
            marginLeft: 8,
            paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999,
            borderWidth: 1, borderColor: theme.border,
            backgroundColor: 'transparent'
          }}
        >
          <Text style={{ color: theme.text }}>Export</Text>
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
              // Adds Alert to show Yes/No dialog before resetting
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
                        showToast('Reset!')
                      }
                    }
                  ]
                )
              }}
              onLongPress={() => startEdit(item)}
            />
          )}
        />
      )}

      {/* accent footer (fixed) */}
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 6, backgroundColor: theme.primary }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 6, height: 1, backgroundColor: '#ffffff22' }} />

      <FAB onPress={() => {
        setAddTitle('')
        setAddEmoji('')
        setAddTarget('')
        setAdding(true)
      }} />

      {/* ADD MODAL */}
      <Modal visible={adding} transparent animationType="fade" onRequestClose={() => setAdding(false)}>
        <View style={{ flex:1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems:'center', justifyContent:'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 440, backgroundColor: theme.card, borderColor: theme.border, borderWidth:1, borderRadius: 12, padding: 16 }}>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Add Counter</Text>

            <Text style={{ color: theme.text, marginBottom: 6 }}>Title</Text>
            <TextInput
              value={addTitle}
              onChangeText={setAddTitle}
              placeholder="Title"
              placeholderTextColor="#666"
              style={{ color: theme.text, backgroundColor: theme.bg, borderColor: theme.border, borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 }}
            />

            <Text style={{ color: theme.text, marginBottom: 6 }}>Emoji</Text>
            <TextInput
              value={addEmoji}
              onChangeText={setAddEmoji}
              placeholder="e.g. 💇"
              placeholderTextColor="#666"
              style={{ color: theme.text, backgroundColor: theme.bg, borderColor: theme.border, borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 }}
            />

            {/* Quick emoji picker (Add) */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {COMMON_EMOJIS.map(e => (
                <Pressable
                  key={e}
                  onPress={() => setAddEmoji(e)}
                  style={{
                    borderWidth: 1,
                    borderColor: addEmoji === e ? theme.primary : theme.border,
                    backgroundColor: addEmoji === e ? '#1d263b' : theme.bg,
                    borderRadius: 8,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{e}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={{ color: theme.text, marginBottom: 6 }}>Target days</Text>
            <TextInput
              value={addTarget}
              onChangeText={setAddTarget}
              keyboardType="numeric"
              placeholder="e.g. 30"
              placeholderTextColor="#666"
              style={{ color: theme.text, backgroundColor: theme.bg, borderColor: theme.border, borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 16 }}
            />

            {/* Buttons */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: '100%', gap: 10, justifyContent: 'flex-end' }}>
              <Pressable
                onPress={() => setAdding(false)}
                style={{ backgroundColor: '#1a1f27', borderColor: theme.border, borderWidth: 1, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, flexGrow: 1, minWidth: '48%', alignItems: 'center' }}
              >
                <Text style={{ color: '#c8cbd0', fontWeight: '700' }}>Cancel</Text>
              </Pressable>

              <Pressable
                disabled={!addTitle.trim()}
                onPress={addNew}
                style={{ opacity: addTitle.trim() ? 1 : 0.5, backgroundColor: theme.primary, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, flexGrow: 1, minWidth: '48%', alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* EXPORT MODAL */}
      <Modal visible={exportOpen} transparent animationType="fade" onRequestClose={() => setExportOpen(false)}>
        <View style={{ flex:1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems:'center', justifyContent:'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 540, maxHeight: '80%', backgroundColor: theme.card, borderColor: theme.border, borderWidth:1, borderRadius: 12, padding: 16 }}>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Export JSON</Text>

            <Text style={{ color: '#9aa0a6', marginBottom: 8 }}>
              Long-press to select and copy. This includes all counters (archived too).
            </Text>

            <View style={{ flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: 8, backgroundColor: theme.bg, padding: 12 }}>
              <Text
                selectable
                style={{ color: '#cfe1ff', fontFamily: 'monospace', fontSize: 12, lineHeight: 18 }}
              >
                {JSON.stringify(items, null, 2)}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: '100%', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
              <Pressable
                onPress={() => setExportOpen(false)}
                style={{ backgroundColor: '#1a1f27', borderColor: theme.border, borderWidth: 1, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, flexGrow: 1, minWidth: '48%', alignItems: 'center' }}
              >
                <Text style={{ color: '#c8cbd0', fontWeight: '700' }}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT MODAL */}
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

            {/* Quick emoji picker (Edit) */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {COMMON_EMOJIS.map(e => (
                <Pressable
                  key={e}
                  onPress={() => setEditEmoji(e)}
                  style={{
                    borderWidth: 1,
                    borderColor: editEmoji === e ? theme.primary : theme.border,
                    backgroundColor: editEmoji === e ? '#1d263b' : theme.bg,
                    borderRadius: 8,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{e}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={{ color: theme.text, marginBottom: 6 }}>Target days</Text>
            <TextInput
              value={editTarget}
              onChangeText={setEditTarget}
              keyboardType="numeric"
              placeholder="e.g. 30"
              placeholderTextColor="#666"
              style={{ color: theme.text, backgroundColor: theme.bg, borderColor: theme.border, borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 16 }}
            />

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: '100%', gap: 10, justifyContent: 'flex-end' }}>
              <Pressable onPress={() => setEditing(null)} style={{ backgroundColor: '#1a1f27', borderColor: theme.border, borderWidth: 1, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, flexGrow: 1, minWidth: '48%', alignItems: 'center' }}>
                <Text style={{ color: '#c8cbd0', fontWeight: '700' }}>Cancel</Text>
              </Pressable>

              <Pressable onPress={deleteItem} style={{ backgroundColor: '#372527', borderColor: '#4E1F25', borderWidth: 1, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, flexGrow: 1, minWidth: '48%', alignItems: 'center' }}>
                <Text style={{ color: '#FF6B6B', fontWeight: '700' }}>Delete</Text>
              </Pressable>

              <Pressable
                onPress={async () => {
                  if (!editing) return
                  if (editing.archived) {
                    await countersRepo.unarchive(editing.id)
                    showToast('Unarchived')
                  } else {
                    await countersRepo.archive(editing.id)
                    showToast('Archived')
                  }
                  setEditing(null)
                  reload()
                }}
                style={{
                  backgroundColor: editing?.archived ? '#233224' : '#2c2a1c',
                  borderColor: editing?.archived ? '#2d5430' : '#5a4f1f',
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  flexGrow: 1,
                  minWidth: '48%',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: editing?.archived ? '#9DFFB0' : '#F3E38A', fontWeight: '700' }}>
                  {editing?.archived ? 'Unarchive' : 'Archive'}
                </Text>
              </Pressable>

              <Pressable
                onPress={duplicateSelected}
                style={{
                  backgroundColor: '#1f2a38',
                  borderColor: '#293545',
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  flexGrow: 1,
                  minWidth: '48%',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#cfe1ff', fontWeight: '700' }}>Duplicate</Text>
              </Pressable>

              <Pressable
                disabled={!editTitle.trim()}
                onPress={saveEdit}
                style={{ opacity: editTitle.trim() ? 1 : 0.5, backgroundColor: theme.primary, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, flexGrow: 1, minWidth: '48%', alignItems: 'center' }}
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
