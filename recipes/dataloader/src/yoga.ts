import { createSchema, createYoga } from 'graphql-yoga'
import { db, type OrderRow } from './db.ts'
import { yogaLogger } from './logger.ts'

export const typeDefs = /* GraphQL */ `
  type Customer {
    id: ID!
    name: String!
  }

  type Order {
    id: ID!
    total: Float!
    "null when the customer no longer exists"
    customer: Customer
  }

  type Query {
    orders: [Order!]!
  }
`

export const yoga = createYoga({
  logging: yogaLogger,
  schema: createSchema({
    typeDefs,
    resolvers: {
      Query: {
        orders: () => db.orders.findMany(),
      },
      Order: {
        // N+1: one database query per order.
        customer: (order: OrderRow) => db.customers.findById(order.customerId),
      },
    },
  }),
})
