export type Order = {
  id: string
  status: 'OPEN' | 'PAID'
  totalCents: number
  currency: string
  placedAt: string
}

export const orders: Order[] = [
  {
    id: 'o-1',
    status: 'OPEN',
    totalCents: 16_700,
    currency: 'EUR',
    placedAt: '2026-10-01T09:00:00Z',
  },
  {
    id: 'o-2',
    status: 'PAID',
    totalCents: 34_900,
    currency: 'EUR',
    placedAt: '2026-10-02T10:30:00Z',
  },
]
