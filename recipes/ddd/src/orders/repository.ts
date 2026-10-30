import type { Order, Rejection } from './order.ts'

export type BillingContact = Readonly<{ id: string; name: string; email: string }>

const seedOrders: readonly Order[] = [
  {
    id: 'o-1',
    customerId: 'c-1',
    status: 'PLACED',
    items: [{ productId: 'p-1', quantity: 2, priceCents: 1290 }],
  },
  {
    id: 'o-2',
    customerId: 'c-2',
    status: 'PAID',
    items: [{ productId: 'p-2', quantity: 1, priceCents: 2490 }],
  },
  {
    id: 'o-3',
    customerId: 'c-1',
    status: 'DRAFT',
    items: [
      { productId: 'p-1', quantity: 1, priceCents: 1290 },
      { productId: 'p-3', quantity: 4, priceCents: 390 },
    ],
  },
  {
    id: 'o-4',
    customerId: 'c-2',
    status: 'SHIPPED',
    items: [{ productId: 'p-2', quantity: 2, priceCents: 2490 }],
  },
  { id: 'o-5', customerId: 'c-1', status: 'DRAFT', items: [] },
]

const billingContacts: readonly BillingContact[] = [
  { id: 'c-1', name: 'Ada Lovelace', email: 'ada@example.com' },
  { id: 'c-2', name: 'Grace Hopper', email: 'grace@example.com' },
]

let orders = new Map(seedOrders.map((order) => [order.id, order]))

export const resetOrders = () => {
  orders = new Map(seedOrders.map((order) => [order.id, order]))
}

export const findOrdersByIds = (ids: readonly string[]) => ids.map((id) => orders.get(id) ?? null)

export const findOpenOrders = () =>
  [...orders.values()].filter(({ status }) => status === 'DRAFT' || status === 'PLACED')

export const findBillingContactsByIds = (ids: readonly string[]) =>
  ids.map((id) => billingContacts.find((contact) => contact.id === id) ?? null)

// One call is one transaction around one aggregate: load it, let a pure function decide, store it.
// With Postgres, the BEGIN, the SELECT ... FOR UPDATE and the UPDATE live here.
export const change = (
  orderId: string,
  decide: (order: Order) => Order | Rejection,
): Order | Rejection => {
  const order = orders.get(orderId)
  if (!order) return { rejected: 'OrderNotFound', message: `Check the order id ${orderId}.` }
  const decision = decide(order)
  if ('rejected' in decision) return decision
  orders.set(orderId, decision)
  return decision
}
