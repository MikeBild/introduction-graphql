import { setTimeout as sleep } from 'node:timers/promises'
import { createSchema } from 'graphql-yoga'

type Order = { id: string; customerId: string }
const orders: Order[] = [
  { id: 'o-1', customerId: 'c-1' },
  { id: 'o-2', customerId: 'c-404' },
]

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Customer {
      id: ID!
      name: String!
    }
    type Order {
      id: ID!
      customer: Customer
    }
    type Query {
      orders: [Order!]!
    }
  `,
  resolvers: {
    Query: { orders: () => orders },
    Order: {
      // Simulates a slow CRM call that sometimes fails.
      customer: async (order: Order) => {
        await sleep(20)
        if (order.customerId === 'c-404') throw new Error('CRM service unavailable')
        return { id: order.customerId, name: 'Ada Lovelace' }
      },
    },
  },
})
