export type Order = {
  id: string
  productId: string
  quantity: number
  street: string
  customerId: string
}

export const stock = new Map<string, number>([
  ['p-1', 10],
  ['p-2', 0],
])

export const orders: Order[] = [
  { id: 'o-1', productId: 'p-1', quantity: 1, street: 'Main St 1', customerId: 'c-1' },
]

export const customers = new Map([['c-1', { id: 'c-1', name: 'Ada Lovelace' }]])

export const createOrder = (input: Omit<Order, 'id'>): Order => {
  const order = { id: `o-${orders.length + 1}`, ...input }
  orders.push(order)
  stock.set(input.productId, (stock.get(input.productId) ?? 0) - input.quantity)
  return order
}
