// The Order aggregate as pure functions: an order goes in, a new order or a rejection comes out.
// No database, no context, no GraphQL.
export type OrderStatus = 'DRAFT' | 'PLACED' | 'PAID' | 'SHIPPED' | 'CANCELLED'

export type OrderItem = Readonly<{ productId: string; quantity: number; priceCents: number }>

export type Order = Readonly<{
  id: string
  customerId: string
  status: OrderStatus
  items: readonly OrderItem[]
}>

export type Rejection = Readonly<{
  rejected: 'OrderNotFound' | 'OrderNotEditable' | 'EmptyOrder' | 'OrderNotCancellable'
  message: string
}>

export const totalCents = (order: Order) =>
  order.items.reduce((sum, item) => sum + item.quantity * item.priceCents, 0)

export const place = (order: Order): Order | Rejection => {
  if (order.status !== 'DRAFT')
    return { rejected: 'OrderNotEditable', message: 'Only draft orders can be placed.' }
  if (order.items.length === 0)
    return { rejected: 'EmptyOrder', message: 'Add at least one item to place this order.' }
  return { ...order, status: 'PLACED' }
}

export const cancel = (order: Order): Order | Rejection => {
  if (order.status !== 'DRAFT' && order.status !== 'PLACED')
    return {
      rejected: 'OrderNotCancellable',
      message: `An order in status ${order.status} can no longer be cancelled.`,
    }
  return { ...order, status: 'CANCELLED' }
}

export const removeItem =
  (productId: string) =>
  (order: Order): Order | Rejection => {
    if (order.status !== 'DRAFT')
      return { rejected: 'OrderNotEditable', message: 'Only draft orders can change their items.' }
    return { ...order, items: order.items.filter((item) => item.productId !== productId) }
  }
