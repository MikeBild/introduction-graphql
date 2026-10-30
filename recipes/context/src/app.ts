import { randomUUID } from 'node:crypto'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { db, type OrderItemRow, type OrderRow } from './db.ts'
import { createLoaders } from './loaders.ts'

const typeDefs = /* GraphQL */ `
  type Product {
    id: ID!
    name: String!
  }

  type OrderItem {
    quantity: Int!
    "null when the product no longer exists"
    product: Product
  }

  type Order {
    id: ID!
    items: [OrderItem!]!
  }

  type Query {
    orders: [Order!]!
    orderCount: Int!
    "The id of this request, from the x-request-id header or generated"
    requestId: ID!
  }
`

// Created once at startup, so every request of every user shares this cache.
const loaders = createLoaders()

type Context = { orders?: OrderRow[] }

const resolvers = {
  Query: {
    orders: async (_parent: unknown, _args: unknown, context: Context) => {
      const rows = await db.orders.findMany()
      // A resolver writes into the context, hoping another resolver reads it later.
      context.orders = rows
      return rows
    },
    orderCount: (_parent: unknown, _args: unknown, context: Context) => context.orders?.length ?? 0,
    requestId: () => randomUUID(),
  },
  OrderItem: {
    product: (item: OrderItemRow) => loaders.product.load(item.productId),
  },
}

export const createApp = async () => {
  const server = new ApolloServer<Context>({ typeDefs, resolvers })
  await server.start()
  const app = express()
  app.use('/graphql', express.json(), expressMiddleware(server, { context: async () => ({}) }))
  return app
}
