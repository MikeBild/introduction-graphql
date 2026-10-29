// The workshop shop: products, customers, orders. Money is always in whole cents.

export type ProductId = string & { readonly __brand: 'ProductId' }
export type OrderId = string & { readonly __brand: 'OrderId' }
export type CustomerId = string & { readonly __brand: 'CustomerId' }

export type Product = { id: ProductId; name: string; priceCents: number; stock: number }
export type Customer = { id: CustomerId; name: string; email: string }
export type OrderStatus = 'DRAFT' | 'PLACED' | 'PAID' | 'SHIPPED' | 'CANCELLED'
export type OrderItem = { productId: ProductId; quantity: number; priceCents: number }
export type Order = {
  id: OrderId
  customerId: CustomerId
  items: OrderItem[]
  status: OrderStatus
  createdAt: string
}

const productId = (id: string) => id as ProductId
const customerId = (id: string) => id as CustomerId
const orderId = (id: string) => id as OrderId

export const products: Product[] = [
  { id: productId('p-1'), name: 'Hammer', priceCents: 1290, stock: 10 },
  { id: productId('p-2'), name: 'Screwdriver set', priceCents: 2490, stock: 3 },
  { id: productId('p-3'), name: 'Workbench', priceCents: 18900, stock: 0 },
]

export const customers: Customer[] = [
  { id: customerId('c-1'), name: 'Ada Lovelace', email: 'ada@example.com' },
  { id: customerId('c-2'), name: 'Grace Hopper', email: 'grace@example.com' },
]

export const orders: Order[] = [
  {
    id: orderId('o-1'),
    customerId: customerId('c-1'),
    items: [{ productId: productId('p-1'), quantity: 2, priceCents: 1290 }],
    status: 'PLACED',
    createdAt: '2026-10-01T09:00:00.000Z',
  },
  {
    id: orderId('o-2'),
    customerId: customerId('c-2'),
    items: [{ productId: productId('p-2'), quantity: 1, priceCents: 2490 }],
    status: 'PAID',
    createdAt: '2026-10-02T09:00:00.000Z',
  },
  {
    id: orderId('o-3'),
    customerId: customerId('c-1'),
    items: [{ productId: productId('p-1'), quantity: 1, priceCents: 1290 }],
    status: 'DRAFT',
    createdAt: '2026-10-03T09:00:00.000Z',
  },
]

export const findProduct = (id: string) => products.find((product) => product.id === id)
export const findOrder = (id: string) => orders.find((order) => order.id === id)
export const totalCents = (order: Order) =>
  order.items.reduce((sum, item) => sum + item.quantity * item.priceCents, 0)

export type PlaceOrderError = {
  code: 'EMPTY_ORDER' | 'UNKNOWN_PRODUCT' | 'OUT_OF_STOCK'
  message: string
}

// The business rule, free of GraphQL: at least one item, enough stock, prices from the catalog.
export const placeOrder = (
  owner: CustomerId,
  items: { productId: string; quantity: number }[],
): Order | PlaceOrderError => {
  if (items.length === 0)
    return { code: 'EMPTY_ORDER', message: 'An order needs at least one item' }
  for (const item of items) {
    const product = findProduct(item.productId)
    if (!product) return { code: 'UNKNOWN_PRODUCT', message: `Unknown product ${item.productId}` }
    if (item.quantity < 1 || product.stock < item.quantity)
      return { code: 'OUT_OF_STOCK', message: `Not enough ${product.name} in stock` }
  }
  const order: Order = {
    id: orderId(`o-${orders.length + 1}`),
    customerId: owner,
    items: items.map((item) => {
      const product = findProduct(item.productId)!
      product.stock -= item.quantity
      return { productId: product.id, quantity: item.quantity, priceCents: product.priceCents }
    }),
    status: 'PLACED',
    createdAt: new Date().toISOString(),
  }
  orders.push(order)
  return order
}

// Stands in for JWT or session verification: maps a bearer token to a customer, or null.
const tokens = new Map([
  ['token-ada', 'c-1'],
  ['token-grace', 'c-2'],
])

export const verifyToken = (authorization: string | null): Customer | null => {
  const id = tokens.get(authorization?.replace(/^Bearer /, '') ?? '')
  return customers.find((customer) => customer.id === id) ?? null
}
