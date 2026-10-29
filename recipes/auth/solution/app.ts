import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import {
  customers,
  findCustomer,
  orders,
  verifyToken,
  type Customer,
  type Order,
  type User,
} from '../src/data.ts'
import { canSeeContactData, canSeeOrder, requireRole, requireUser } from './policies.ts'

export type Context = { user: User | null }

const typeDefs = /* GraphQL */ `
  type Customer {
    id: ID!
    name: String!
    "Only visible to SUPPORT, null for everybody else"
    email: String
  }

  type Order {
    id: ID!
    totalCents: Int!
    customer: Customer!
  }

  type Query {
    "The orders the caller may see: their own, or all for SUPPORT"
    orders: [Order!]!
    "null if the order does not exist or belongs to someone else"
    order(id: ID!): Order
    "SUPPORT only"
    customers: [Customer!]!
  }
`

const resolvers = {
  Query: {
    orders: (_parent: unknown, _args: unknown, { user }: Context) => {
      const known = requireUser(user)
      return orders.filter((order) => canSeeOrder(known, order))
    },
    order: (_parent: unknown, { id }: { id: string }, { user }: Context) => {
      const known = requireUser(user)
      const order = orders.find((candidate) => candidate.id === id)
      // Same answer for "missing" and "not yours": nothing to learn from probing ids.
      return order && canSeeOrder(known, order) ? order : null
    },
    customers: (_parent: unknown, _args: unknown, { user }: Context) => {
      requireRole(user, 'SUPPORT')
      return customers
    },
  },
  Order: {
    customer: (order: Order) => findCustomer(order.customerId),
  },
  Customer: {
    // Authorization per field: applies on every path that reaches a Customer.
    email: (customer: Customer, _args: unknown, { user }: Context) =>
      canSeeContactData(user, customer) ? customer.email : null,
  },
}

export const createApp = async () => {
  const server = new ApolloServer<Context>({ typeDefs, resolvers })
  await server.start()
  const app = express()
  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      // Authentication: who is asking? A missing or unknown token is not an error, just no user.
      context: async ({ req }): Promise<Context> => ({
        user: await verifyToken(req.headers.authorization ?? null),
      }),
    }),
  )
  return app
}
