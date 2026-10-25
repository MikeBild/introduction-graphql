export type Order = { id: string; placedAt: Date; contactEmail: string | null }

export const orders: Order[] = [
  { id: 'o-1', placedAt: new Date('2026-10-01T09:00:00Z'), contactEmail: 'ada@example.com' },
  { id: 'o-2', placedAt: new Date('2026-10-05T10:30:00+02:00'), contactEmail: null },
  { id: 'o-3', placedAt: new Date('2026-10-09T14:15:00Z'), contactEmail: 'alan@example.com' },
]

export const placedAfter = (date: Date | null | undefined) =>
  orders.filter((order) => !date || order.placedAt.getTime() > date.getTime())
