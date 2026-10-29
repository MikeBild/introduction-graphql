import { setTimeout as sleep } from 'node:timers/promises'

type Order = { id: string; customerId: string; status: 'PLACED' | 'PAID' }
const orders: Order[] = [
  { id: 'o-1', customerId: 'c-1', status: 'PLACED' },
  { id: 'o-2', customerId: 'c-404', status: 'PAID' },
]

export const typeDefs = /* GraphQL */ `
  enum OrderStatus {
    DRAFT
    PLACED
    PAID
    SHIPPED
    CANCELLED
  }
  type Customer {
    id: ID!
    name: String!
    email: String!
  }
  type Order {
    id: ID!
    status: OrderStatus!
    "From the CRM: slow, and sometimes it fails"
    customer: Customer
  }
  type Query {
    orders: [Order!]!
  }
`

export const resolvers = {
  Query: { orders: () => orders },
  Order: {
    // Simulates a slow CRM call that sometimes fails.
    customer: async (order: Order) => {
      await sleep(20)
      if (order.customerId === 'c-404') throw new Error('CRM service unavailable')
      return { id: order.customerId, name: 'Ada Lovelace', email: 'ada@example.com' }
    },
  },
}
