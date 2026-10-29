// Domain "orders": owned by the order team, no GraphQL in here. Money in whole cents.
export type OrderStatus = 'DRAFT' | 'PLACED' | 'PAID' | 'SHIPPED' | 'CANCELLED'
export type OrderItem = { productId: string; quantity: number; priceCents: number }
export type Order = {
  id: string
  customerId: string
  items: OrderItem[]
  status: OrderStatus
  createdAt: string
}

const orders: Order[] = [
  {
    id: 'o-1',
    customerId: 'c-1',
    items: [{ productId: 'p-1', quantity: 2, priceCents: 1290 }],
    status: 'PLACED',
    createdAt: '2026-10-01T09:00:00Z',
  },
  {
    id: 'o-2',
    customerId: 'c-2',
    items: [{ productId: 'p-2', quantity: 1, priceCents: 2490 }],
    status: 'SHIPPED',
    createdAt: '2026-10-02T10:30:00Z',
  },
  {
    id: 'o-3',
    customerId: 'c-1',
    items: [{ productId: 'p-1', quantity: 1, priceCents: 1290 }],
    status: 'DRAFT',
    createdAt: '2026-09-01T08:00:00Z',
  },
]

export const listOrders = () => [...orders]
export const findOrder = (orderId: string) => orders.find((order) => order.id === orderId)
export const ordersOfCustomer = (customerId: string) =>
  orders.filter((order) => order.customerId === customerId)
export const totalCents = (order: Order) =>
  order.items.reduce((sum, item) => sum + item.quantity * item.priceCents, 0)
export const saveOrder = (changed: Order) => {
  orders.splice(
    orders.findIndex((order) => order.id === changed.id),
    1,
    changed,
  )
  return changed
}
