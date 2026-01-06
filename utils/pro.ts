
export const FREE_LIMITS = {
  counters: 5,
  categories: 2,
  historyDays: 7,
} as const;

export type PaywallReason = "counters" | "categories" | "history";

export function getPaywallSubtitle(reason: PaywallReason): string {
  switch (reason) {
    case "counters":
      return `Looks like you’ve hit the free limit of ${FREE_LIMITS.counters} counters.\nUpgrade to Pro to keep adding as many as you want.`;
    case "history":
      return `Want to see more of your progress?\nFree shows ${FREE_LIMITS.historyDays} days. Pro unlocks full history.`;
    case "categories":
      return `You’re using categories—love that.\nFree includes ${FREE_LIMITS.categories} categories. Pro unlocks unlimited.`;
  }
}

export function canCreateCounter(currentCount: number, isPro: boolean): boolean {
  if (isPro) return true;
  return currentCount < FREE_LIMITS.counters;
}

export function canCreateCategory(currentCount: number, isPro: boolean): boolean {
  if (isPro) return true;
  return currentCount < FREE_LIMITS.categories;
}

export function canViewHistory(requestedDays: number | null, isPro: boolean): boolean {
  if (isPro) return true;
  if (requestedDays === null) return false; // "All time" requires Pro
  return requestedDays <= FREE_LIMITS.historyDays;
}
