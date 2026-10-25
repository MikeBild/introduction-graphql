export type OrderStatus = 'OPEN' | 'PAID' | 'SHIPPED' | 'CANCELLED'
export type Order = {
  id: string
  customerId: string
  status: OrderStatus
  total: number
  placedAt: string
}

const orders: Order[] = [
  { id: 'o-1', customerId: 'c-1', status: 'OPEN', total: 167, placedAt: '2026-10-01T09:00:00Z' },
  { id: 'o-2', customerId: 'c-2', status: 'SHIPPED', total: 349, placedAt: '2026-10-02T10:30:00Z' },
  { id: 'o-3', customerId: 'c-1', status: 'OPEN', total: 39, placedAt: '2026-09-01T08:00:00Z' },
]

// Domain "orders": owned by the order team, no GraphQL in here.
export const listOrders = () => [...orders]
export const findOrder = (orderId: string) => orders.find((order) => order.id === orderId)
export const ordersOfCustomer = (customerId: string) =>
  orders.filter((order) => order.customerId === customerId)
export const saveOrder = (changed: Order) => {
  orders.splice(
    orders.findIndex((order) => order.id === changed.id),
    1,
    changed,
  )
  return changed
}
