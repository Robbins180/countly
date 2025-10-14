export const MS_DAY = 86_400_000
export const daysSince = (ts: number) => Math.floor((Date.now() - ts) / MS_DAY)
