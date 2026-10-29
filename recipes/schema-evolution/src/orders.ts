// The workshop shop: orders with items. Money is always in whole cents.
export type OrderStatus = 'DRAFT' | 'PLACED' | 'PAID' | 'CANCELLED'
export type OrderItem = { productId: string; quantity: number; priceCents: number }
export type Order = {
  id: string
  customerId: string
  items: OrderItem[]
  status: OrderStatus
  createdAt: string
}

export const orders: Order[] = [
  {
    id: 'o-1',
    customerId: 'c-1',
    items: [{ productId: 'p-1', quantity: 2, priceCents: 1290 }],
    status: 'PLACED',
    createdAt: '2026-10-01T09:00:00.000Z',
  },
  {
    id: 'o-2',
    customerId: 'c-2',
    items: [
      { productId: 'p-2', quantity: 1, priceCents: 2490 },
      { productId: 'p-1', quantity: 1, priceCents: 1290 },
    ],
    status: 'PAID',
    createdAt: '2026-10-02T10:30:00.000Z',
  },
]

// Total = Σ quantity × priceCents
export const totalCents = (order: Order) =>
  order.items.reduce((sum, item) => sum + item.quantity * item.priceCents, 0)
