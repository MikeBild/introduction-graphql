// Werkstatt-Shop: money is always integer cents.
export type OrderStatus = 'DRAFT' | 'PLACED' | 'PAID' | 'SHIPPED' | 'CANCELLED'
export type OrderItem = { productId: string; quantity: number; priceCents: number }
export type Order = {
  id: string
  customerId: string
  items: OrderItem[]
  status: OrderStatus
  street: string
  createdAt: string
}
export type Product = { id: string; name: string; priceCents: number; stock: number }

export const products = new Map<string, Product>([
  ['p-1', { id: 'p-1', name: 'Keyboard', priceCents: 8900, stock: 10 }],
  ['p-2', { id: 'p-2', name: 'Mouse', priceCents: 3900, stock: 0 }],
])

export const orders: Order[] = [
  {
    id: 'o-1',
    customerId: 'c-1',
    items: [{ productId: 'p-1', quantity: 1, priceCents: 8900 }],
    status: 'PLACED',
    street: 'Main St 1',
    createdAt: '2026-10-01T09:00:00Z',
  },
]

export const customers = new Map([['c-1', { id: 'c-1', name: 'Ada Lovelace' }]])

// The first item whose product is unknown or has too little stock, if any.
export const missingStock = (items: { productId: string; quantity: number }[]) =>
  items.find((line) => (products.get(line.productId)?.stock ?? 0) < line.quantity)

export const createOrder = (
  customerId: string,
  items: { productId: string; quantity: number }[],
  street: string,
): Order => {
  const order: Order = {
    id: `o-${orders.length + 1}`,
    customerId,
    items: items.map((line) => ({
      ...line,
      priceCents: products.get(line.productId)?.priceCents ?? 0,
    })),
    status: 'PLACED',
    street,
    createdAt: new Date().toISOString(),
  }
  orders.push(order)
  for (const line of items) {
    const product = products.get(line.productId)
    if (product) product.stock -= line.quantity
  }
  return order
}
