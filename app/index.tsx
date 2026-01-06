// app/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from "expo-router";
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { CounterCard } from '../components/CounterCard';
import { FAB } from '../components/FAB';
import { Header } from '../components/Header';
import { historyRepo } from '../data';
import { MS_DAY, daysSince } from '../utils/date';
import { appendHistoryEntry } from "../utils/history";
import { canCreateCounter, getPaywallSubtitle } from "../utils/pro";
import { theme } from '../utils/theme';




// NEW: the storage repo (AsyncStorage-backed)
import { countersRepo } from '../data';

// Local category type for the UI
  type CounterCategoryKey = 'work' | 'health' | 'home' | 'personal' | 'other'

// Derive Counter shape from the repo and extend for UI
  type Counter = Awaited<ReturnType<typeof countersRepo.all>>[number] & {
    category?: CounterCategoryKey | null
  }

export default function Home() {
  // holds persisted counters
  const [items, setItems] = useState<Counter[]>([])
  const [editing, setEditing] = useState<Counter | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editEmoji, setEditEmoji] = useState('')
  const [editTarget, setEditTarget] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [completeItem, setCompleteItem] = useState<Counter | null>(null)

    // Category filter: 'all' or specific category key
  const [categoryFilter, setCategoryFilter] = useState<'all' | CounterCategoryKey>('all')


  // ADD MODAL state
  const [adding, setAdding] = useState(false)
  const [addTitle, setAddTitle] = useState('')
  const [addEmoji, setAddEmoji] = useState('')
  const [addTarget, setAddTarget] = useState('')
  const [exportOpen, setExportOpen] = useState(false)
  const [addCategory, setAddCategory] = useState<CounterCategoryKey>('other')
  const [editCategory, setEditCategory] = useState<CounterCategoryKey>('other')


  const COMMON_EMOJIS = ['💇','🛢️','🚗','🍷','🥗','🏋️','📚','🧹','🧼','🛒','💊','🧑‍🍳','🪥','🧵','🧰','📦','🛏️','🔋','🔧','📞','💡']

    const CATEGORIES: { key: CounterCategoryKey; label: string; emoji: string }[] = [
    { key: "work", label: "Work", emoji: "💼" },
    { key: "health", label: "Health", emoji: "💪" },
    { key: "home", label: "Home", emoji: "🏠" },
    { key: "personal", label: "Personal", emoji: "✨" },
    { key: "other", label: "Other", emoji: "📦" },
  ];


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

  // History-derived: how many times each counter was completed in the last 7 days
  const [completionsThisWeek, setCompletionsThisWeek] = useState<Record<string, number>>({})

  // Pro Features
  const isPro = false;


  // Due Soon Feature
  const SOON_THRESHOLD_DAYS = 3
  type ItemStatus = "due" | "soon" | null

    // --- History groundwork: basic event log for completions ---
  type CounterEventType = 'completed';

  type CounterEvent = {
    id: string;
    counterId: string;
    at: number;
    type: CounterEventType;
    titleSnapshot: string;
  };

  const HISTORY_KEY = "history.events";

    async function appendHistoryEvent(evt: Omit<CounterEvent, "id">) {
      try {
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        const list: CounterEvent[] = raw ? JSON.parse(raw) : [];
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const next = [...list, { ...evt, id }];

        // keep existing behavior
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));

        // NEW: also mirror to the unified history store
        await appendHistoryEntry({
          id: evt.counterId,              // existing field on CounterEvent
          label: evt.titleSnapshot,       // existing field on CounterEvent
          valueAfter: 0,                  // not used by Insights (yet)
          delta: 0,                       // not used by Insights (yet)
          type: "completed",
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        console.error("Failed to append history event", e);
      }
    }



    // Recompute "completionsThisWeek" from history.events
  async function recomputeHistoryCounts() {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY)
      const list: CounterEvent[] = raw ? JSON.parse(raw) : []

      const now = Date.now()
      const cutoff = now - 7 * MS_DAY // last 7 days

      const map: Record<string, number> = {}

      for (const evt of list) {
        if (evt.type !== 'completed') continue
        if (evt.at < cutoff) continue
        map[evt.counterId] = (map[evt.counterId] ?? 0) + 1
      }

      setCompletionsThisWeek(map)
    } catch (e) {
      console.error('Failed to recompute history counts', e)
    }
  }

  // Load history counts on first mount
  useEffect(() => {
    recomputeHistoryCounts()
  }, [])



  ////////////////////////////////////////////// functions //////////////////////////////////////

  // Start of Edit Functions
  function startEdit(item: Counter) {
    setEditing(item)
    setEditTitle(item.title)
    setEditEmoji(item.emoji ?? '')
    setEditTarget(item.targetDays != null ? String(item.targetDays) : '')
    setEditCategory((item.category as CounterCategoryKey) ?? 'other')
  }

  // Toast function
  const showToast = (msg: string) => {
    setToast(msg)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 1600)
  }

  // Quick cleanup for toast on unmount
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
      category: editCategory,
    })
    setEditing(null)
    reload()
  }

    function deleteItem() {
    if (!editing) return

    Alert.alert(
      'Delete counter?',
      `This will permanently delete “${editing.title}”. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await countersRepo.remove(editing.id)
              setEditing(null)
              reload()
              showToast('Deleted')
            } catch (e) {
              console.error('Failed to delete counter', e)
            }
          },
        },
      ]
    )
  }


    // create a new counter
        async function addNew() {
      try {
        if (!addTitle.trim()) return;

        const existing = await countersRepo.all();
        const currentCount = existing.filter((m) => !m.archived).length;

        if (!canCreateCounter(currentCount, isPro)) {
          Alert.alert("Upgrade to Pro", getPaywallSubtitle("counters"));
          return;
        }

        await countersRepo.add({
          title: addTitle.trim(),
          emoji: addEmoji.trim() ? addEmoji.trim() : null,
          targetDays: addTarget ? parseInt(addTarget, 10) : null,
          lastAt: Date.now(),
          category: addCategory,
        });

        setAdding(false);
        setAddTitle("");
        setAddEmoji("");
        setAddTarget("");
        setAddCategory("other");

        reload();
      } catch (e: any) {
        console.error("addNew failed", e);
        Alert.alert("Save failed", String(e?.message ?? e));
      }
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
    .filter(m =>
      categoryFilter === 'all'
        ? true
        : (((m.category as CounterCategoryKey) || 'other') === categoryFilter)
      )
    .filter(m => !normalizedFilter || m.title.toLowerCase().includes(normalizedFilter))
    .map(item => {
      const days = daysSince(item.lastAt)
      let status: ItemStatus = null

      if (item.targetDays != null) {
        const delta = item.targetDays - days
        if (delta <= 0) status = 'due'
        else if (delta <= SOON_THRESHOLD_DAYS) status = 'soon'
      }

      const completionsForThisItem = completionsThisWeek[item.id] ?? 0

      return { ...item, days, status, completionsThisWeek: completionsForThisItem }
    })

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

    // --- Minimal, working "Mark as Complete" + log history event ---
    async function markComplete() {
    if (!completeItem) return
    try {
      await countersRepo.reset(completeItem.id)

      // ⭐ NEW: record the history event
      await historyRepo.add({
        counterId: completeItem.id,
        title: completeItem.title,
        emoji: completeItem.emoji ?? null,
        timestamp: Date.now(),  
        action: 'complete',
      })

      setCompleteItem(null)
      reload()
      showToast('Marked complete')
    } catch (e) {
      console.error('Failed to mark complete', e)
    }
  }


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

      {/* CATEGORY FILTER ROW */}
      <View style={{ paddingHorizontal: theme.pad, paddingTop: 4, paddingBottom: 6 }}>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {/* "All" chip */}
          <Pressable
            onPress={() => setCategoryFilter('all')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: categoryFilter === 'all' ? theme.primary : theme.border,
              backgroundColor: categoryFilter === 'all' ? '#1d263b' : 'transparent',
            }}
          >
            <Text style={{ color: categoryFilter === 'all' ? theme.primary : theme.text, fontSize: 13 }}>
              All
            </Text>
          </Pressable>

          {/* Category chips */}
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.key}
              onPress={() => setCategoryFilter(cat.key)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: categoryFilter === cat.key ? theme.primary : theme.border,
                backgroundColor: categoryFilter === cat.key ? '#1d263b' : 'transparent',
                gap: 6,
              }}
            >
              <Text style={{ fontSize: 14 }}>{cat.emoji}</Text>
              <Text
                style={{
                  color: categoryFilter === cat.key ? theme.primary : theme.text,
                  fontSize: 13,
                }}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </View>
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
          
          renderItem={({ item }) => {
            const categoryMeta = CATEGORIES.find(
              (c) => c.key === (item.category as CounterCategoryKey)
            )

            return (
            <CounterCard
              title={item.title}
              emoji={item.emoji ?? undefined}
              days={item.days}
              targetDays={item.targetDays ?? undefined}
              status={item.status}
              completionsThisWeek={item.completionsThisWeek}
               // NEW: category chip
              categoryLabel={categoryMeta?.label}
              categoryEmoji={categoryMeta?.emoji}
              // Tap → open confirm modal
              onPress={() => setCompleteItem(item)}
              onLongPress={() => startEdit(item)}
            />
            )
          }}
        />
      )}

        
      {/* Entry point to Insights */}
      <Link
        href="/insights"
        style={{
          alignSelf: 'center',
          marginBottom: 16,
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: theme.primary,
          backgroundColor: 'transparent',
        }}
      >
        <Text style={{ color: theme.primary, fontWeight: '600' }}>
          View Insights
        </Text>
      </Link>



      {/* accent footer (fixed) */}
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 6, backgroundColor: theme.primary }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 6, height: 1, backgroundColor: '#ffffff22' }} />

      <FAB onPress={() => {
        setAddTitle('')
        setAddEmoji('')
        setAddTarget('')
        setAddCategory('other')
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

            {/*Category Pill*/}
            <Text style={{ color: theme.text, marginBottom: 6 }}>Category</Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 16,
              }}
            >
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.key}
                  onPress={() => setAddCategory(cat.key)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: addCategory === cat.key ? theme.primary : theme.border,
                    backgroundColor: addCategory === cat.key ? '#1d263b' : theme.bg,
                    borderRadius: 999,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    gap: 6,
                  }}
                >
                  <Text style={{ fontSize: 14 }}>{cat.emoji}</Text>
                  <Text style={{ color: theme.text, fontSize: 13 }}>{cat.label}</Text>
                </Pressable>
              ))}
            </View>


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

      {/* MARK COMPLETE MODAL */}
      <Modal
        visible={!!completeItem}
        transparent
        animationType="fade"
        onRequestClose={() => setCompleteItem(null)}
      >
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.6)', alignItems:'center', justifyContent:'center', padding:20 }}>
          <View style={{ width:'100%', maxWidth:440, backgroundColor: theme.card, borderColor: theme.border, borderWidth:1, borderRadius:12, padding:16 }}>
            <Text style={{ color: theme.text, fontSize:18, fontWeight:'700', marginBottom:8 }}>
              Mark as Complete?
            </Text>
            <Text style={{ color:'#9aa0a6', marginBottom:16 }}>
              {completeItem ? `This will set “${completeItem.title}” to 0 days.` : ''}
            </Text>

            <View style={{ flexDirection:'row', flexWrap:'wrap', width:'100%', gap:10, justifyContent:'flex-end' }}>
              <Pressable
                onPress={() => setCompleteItem(null)}
                style={{
                  backgroundColor:'#1a1f27',
                  borderColor: theme.border,
                  borderWidth:1,
                  borderRadius:8,
                  paddingVertical:10,
                  paddingHorizontal:12,
                  flexGrow:1,
                  minWidth:'48%',
                  alignItems:'center'
                }}
              >
                <Text style={{ color:'#c8cbd0', fontWeight:'700' }}>Cancel</Text>
              </Pressable>

              {/* Green confirm */}
              <Pressable
                onPress={markComplete}
                style={{
                  backgroundColor:'#233224',     // deep green bg
                  borderColor:'#2d5430',         // green border
                  borderWidth:1,
                  borderRadius:8,
                  paddingVertical:10,
                  paddingHorizontal:12,
                  flexGrow:1,
                  minWidth:'48%',
                  alignItems:'center'
                }}
              >
                <Text style={{ color:'#9DFFB0', fontWeight:'800' }}>Mark as Complete</Text>
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

            <Text style={{ color: theme.text, marginBottom: 6 }}>Category</Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 16,
              }}
            >
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.key}
                  onPress={() => setEditCategory(cat.key)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: editCategory === cat.key ? theme.primary : theme.border,
                    backgroundColor: editCategory === cat.key ? '#1d263b' : theme.bg,
                    borderRadius: 999,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    gap: 6,
                  }}
                >
                  <Text style={{ fontSize: 14 }}>{cat.emoji}</Text>
                  <Text style={{ color: theme.text, fontSize: 13 }}>{cat.label}</Text>
                </Pressable>
              ))}
            </View>

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

                {/* TOAST */}
          {toast && (
            <View
              style={{
                pointerEvents: "none",
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 72,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  maxWidth: 320,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  backgroundColor: '#111827',
                  borderWidth: 1,
                  borderColor: '#4b5563',
                  shadowColor: '#000',
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 6,
                }}
              >
                <Text
                  style={{
                    color: '#e5e7eb',
                    fontSize: 13,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                >
                  {toast}
                </Text>
              </View>
            </View>
          )}

    </View>
    
  )
}
