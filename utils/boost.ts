// utils/boosts.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Boost = {
  counterId: string;
  multiplier: number;
  endsAt: number;
};

const KEY = 'countly_boosts_v1';

export async function loadBoosts(): Promise<Boost[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalize).filter(isBoost);
  } catch {
    return [];
  }
}

export async function saveBoosts(boosts: Boost[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(boosts));
}

export function cleanupExpired(boosts: Boost[], now = Date.now()): Boost[] {
  return boosts.filter(b => b.endsAt > now);
}

export function getMultiplier(
  boosts: Boost[],
  counterId: string,
  now = Date.now()
): number {
  const active = boosts.find(
    b => b.counterId === counterId && b.endsAt > now
  );
  return active?.multiplier ?? 1;
}

export function upsertBoost(
  boosts: Boost[],
  next: Boost
): Boost[] {
  const rest = boosts.filter(b => b.counterId !== next.counterId);
  return [...rest, next];
}

export function makeBoost(params: {
  counterId: string;
  multiplier: number;
  minutes: number;
}): Boost {
  return {
    counterId: params.counterId,
    multiplier: params.multiplier,
    endsAt: Date.now() + params.minutes * 60_000,
  };
}

function normalize(x: any): Boost | null {
  if (!x) return null;

  return {
    counterId: String(x.counterId ?? ''),
    multiplier: Number(x.multiplier ?? 1),
    endsAt: Number(x.endsAt ?? 0),
  };

  function isBoost(x: Boost | null): x is Boost {
    return x!== null;
  }
}
