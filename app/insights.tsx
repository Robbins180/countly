import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { Header } from '../components/Header';
import { theme } from '../utils/theme';

// Keep this import style consistent with your project.
// If your InsightScreen is a default export, use: import InsightScreen from '../screens/InsightScreen'
import InsightScreen from '../screens/InsightScreen';


import {
  cleanupExpired,
  loadBoosts,
  makeBoost,
  saveBoosts,
  upsertBoost,
  type Boost,
} from '../utils/boost';

import { countersRepo } from '../data';

type InsightsTab = 'insights' | 'boosts';
type Counter = Awaited<ReturnType<typeof countersRepo.all>>[number];

export default function InsightsRoute() {
  const [tab, setTab] = useState<InsightsTab>('insights');

  // --- Counters (for Boosts picker list) ---
  const [items, setItems] = useState<Counter[]>([]);
  const reloadCounters = () => {
    countersRepo.all().then(setItems).catch(console.error);
  };

  useEffect(() => {
    reloadCounters();
  }, []);

  // --- Boosts state ---
  const [boosts, setBoosts] = useState<Boost[]>([]);
  const boostsTickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      const loaded = cleanupExpired(await loadBoosts());
      if (!alive) return;
      setBoosts(loaded);
      await saveBoosts(loaded);
    })();

    boostsTickRef.current = setInterval(() => {
      setBoosts(prev => cleanupExpired(prev));
    }, 5_000);

    return () => {
      alive = false;
      if (boostsTickRef.current) clearInterval(boostsTickRef.current);
    };
  }, []);

  const activate2x30 = async (counterId: string) => {
    const next = makeBoost({ counterId, multiplier: 2, minutes: 30 });

    setBoosts(prev => {
      const updated = cleanupExpired(upsertBoost(prev, next));
      saveBoosts(updated);
      return updated;
    });
  };

  const getTitle = (id: string) => items.find(i => i.id === id)?.title ?? 'Unknown';

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header />

      {/* accent under header */}
      <View style={{ height: 6, backgroundColor: theme.primary }} />
      <View style={{ height: 1, backgroundColor: '#ffffff22' }} />

      {/* TOP TABS */}
      <View style={{ paddingHorizontal: theme.pad, paddingTop: 10, paddingBottom: 8, flexDirection: 'row', gap: 8 }}>
        <Pressable
          onPress={() => setTab('insights')}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: tab === 'insights' ? theme.primary : theme.border,
            backgroundColor: tab === 'insights' ? '#1d263b' : 'transparent',
          }}
        >
          <Text style={{ color: tab === 'insights' ? theme.primary : theme.text, fontWeight: '600' }}>
            Insights
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setTab('boosts')}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: tab === 'boosts' ? theme.primary : theme.border,
            backgroundColor: tab === 'boosts' ? '#1d263b' : 'transparent',
          }}
        >
          <Text style={{ color: tab === 'boosts' ? theme.primary : theme.text, fontWeight: '600' }}>
            Boosts
          </Text>
        </Pressable>
      </View>

      {tab === 'insights' ? (
        <InsightScreen />
      ) : (
        <View style={{ flex: 1, paddingHorizontal: theme.pad, paddingTop: 8 }}>
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: '800', marginBottom: 6 }}>
            Boosts
          </Text>
          <Text style={{ color: '#9aa0a6', marginBottom: 12 }}>
            Tap a counter to activate 2× for 30 minutes.
          </Text>

          <View style={{ borderWidth: 1, borderColor: theme.border, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
            <FlatList
              data={items.filter(i => !i.archived)}
              keyExtractor={(it) => it.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => activate2x30(item.id)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{item.emoji ?? '✨'}</Text>
                  <Text style={{ color: theme.text, fontWeight: '700' }}>{item.title}</Text>
                  <View style={{ flex: 1 }} />
                  <Text style={{ color: theme.primary, fontWeight: '800' }}>2×</Text>
                </Pressable>
              )}
            />
          </View>

          <Text style={{ color: theme.text, fontWeight: '800', marginBottom: 8 }}>
            Active
          </Text>

          {boosts.length === 0 ? (
            <Text style={{ color: '#9aa0a6' }}>No active boosts.</Text>
          ) : (
            <View style={{ gap: 8 }}>
              {boosts
                .slice()
                .sort((a, b) => a.endsAt - b.endsAt)
                .map((b) => {
                  const minsLeft = Math.max(0, Math.ceil((b.endsAt - Date.now()) / 60_000));
                  return (
                    <View
                      key={b.counterId}
                      style={{
                        borderWidth: 1,
                        borderColor: theme.border,
                        backgroundColor: theme.card,
                        borderRadius: 12,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                      }}
                    >
                      <Text style={{ color: theme.text, fontWeight: '800' }}>
                        {getTitle(b.counterId)} — {b.multiplier}×
                      </Text>
                      <Text style={{ color: '#9aa0a6' }}>
                        Ends in ~{minsLeft} min
                      </Text>
                    </View>
                  );
                })}
            </View>
          )}
        </View>
      )}

      {/* accent footer */}
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 6, backgroundColor: theme.primary }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 6, height: 1, backgroundColor: '#ffffff22' }} />
    </View>
  );
}
