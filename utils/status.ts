export type Status = 'ok' | 'near' | 'due'
export function getStatus(days: number, target?: number): Status {
  if (!target) return 'ok'
  if (days >= target) return 'due'
  if (days >= Math.max(1, Math.floor(target * 0.75))) return 'near'
  return 'ok'
}
