import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { db, type OrderRow } from '../src/db.ts'
import { createLoaders, type Loaders } from './loaders.ts'

export type Context = { loaders: Loaders }

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

  type Mutation {
    renameCustomer(id: ID!, name: String!): Customer
  }
`

const resolvers = {
  Query: {
    orders: () => db.orders.findMany(),
  },
  Mutation: {
    renameCustomer: async (
      _parent: unknown,
      { id, name }: { id: string; name: string },
      { loaders }: Context,
    ) => {
      if (!(await loaders.customer.load(id))) return null
      await db.customers.rename(id, name)
      // The loader still holds the old name for this request: clear it, then reload.
      return loaders.customer.clear(id).load(id)
    },
  },
  Order: {
    customer: (order: OrderRow, _args: unknown, { loaders }: Context) =>
      loaders.customer.load(order.customerId),
  },
}

export const createApp = async () => {
  const server = new ApolloServer<Context>({ typeDefs, resolvers })
  await server.start()
  const app = express()
  app.use(
    '/graphql',
    express.json(),
    // Runs once per request: fresh loaders, fresh cache.
    expressMiddleware(server, {
      context: async (): Promise<Context> => ({ loaders: createLoaders() }),
    }),
  )
  return app
}
