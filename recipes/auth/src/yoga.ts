import { createSchema, createYoga } from 'graphql-yoga'
import { findCustomer, orders, type Order } from './data.ts'
import { yogaLogger } from './logger.ts'

const typeDefs = /* GraphQL */ `
  type Customer {
    id: ID!
    name: String!
    email: String
  }

  type Order {
    id: ID!
    total: Float!
    customer: Customer!
  }

  type Query {
    orders: [Order!]!
    order(id: ID!): Order
  }
`

// No context, no checks: whoever asks sees every order and every email address.
export const yoga = createYoga({
  logging: yogaLogger,
  schema: createSchema({
    typeDefs,
    resolvers: {
      Query: {
        orders: () => orders,
        order: (_parent: unknown, { id }: { id: string }) =>
          orders.find((order) => order.id === id) ?? null,
      },
      Order: {
        customer: (order: Order) => findCustomer(order.customerId),
      },
    },
  }),
})
