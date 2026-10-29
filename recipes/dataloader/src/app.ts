import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { db, type OrderRow } from './db.ts'

const typeDefs = /* GraphQL */ `
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

const resolvers = {
  Query: {
    orders: () => db.orders.findMany(),
  },
  Order: {
    // N+1: one database query per order.
    customer: (order: OrderRow) => db.customers.findById(order.customerId),
  },
}

export const createApp = async () => {
  const server = new ApolloServer({ typeDefs, resolvers })
  await server.start()
  const app = express()
  app.use('/graphql', express.json(), expressMiddleware(server))
  return app
}
