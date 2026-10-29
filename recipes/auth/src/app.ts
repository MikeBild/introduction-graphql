import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { findCustomer, orders, type Order } from './data.ts'

const typeDefs = /* GraphQL */ `
  type Customer {
    id: ID!
    name: String!
    email: String
  }

  type Order {
    id: ID!
    totalCents: Int!
    customer: Customer!
  }

  type Query {
    orders: [Order!]!
    order(id: ID!): Order
  }
`

const resolvers = {
  Query: {
    orders: () => orders,
    order: (_parent: unknown, { id }: { id: string }) =>
      orders.find((order) => order.id === id) ?? null,
  },
  Order: {
    customer: (order: Order) => findCustomer(order.customerId),
  },
}

// No context, no checks: whoever asks sees every order and every email address.
export const createApp = async () => {
  const server = new ApolloServer({ typeDefs, resolvers })
  await server.start()
  const app = express()
  app.use('/graphql', express.json(), expressMiddleware(server))
  return app
}
