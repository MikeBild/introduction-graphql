// The Order aggregate as the sales context exposes it. The commands (place, cancel, remove item)
// live in the recipe `ddd`; this recipe only reads orders.
export type OrderStatus = 'DRAFT' | 'PLACED' | 'PAID' | 'SHIPPED' | 'CANCELLED'

export type OrderItem = Readonly<{ productId: string; quantity: number; priceCents: number }>

export type Order = Readonly<{
  id: string
  customerId: string
  status: OrderStatus
  items: readonly OrderItem[]
}>

export const totalCents = (order: Order) =>
  order.items.reduce((sum, item) => sum + item.quantity * item.priceCents, 0)
