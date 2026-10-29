import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { db, type OrderItemRow } from '../src/db.ts'
import { createLoaders, type Loaders } from './loaders.ts'

export type Context = { loaders: Loaders }

const typeDefs = /* GraphQL */ `
  enum OrderStatus {
    DRAFT
    PLACED
    PAID
    SHIPPED
    CANCELLED
  }

  type Product {
    id: ID!
    name: String!
    priceCents: Int!
  }

  type OrderItem {
    quantity: Int!
    priceCents: Int!
    "null when the product no longer exists"
    product: Product
  }

  type Order {
    id: ID!
    status: OrderStatus!
    items: [OrderItem!]!
  }

  type Query {
    orders: [Order!]!
  }

  type Mutation {
    renameProduct(id: ID!, name: String!): Product
  }
`

const resolvers = {
  Query: {
    orders: () => db.orders.findMany(),
  },
  Mutation: {
    renameProduct: async (
      _parent: unknown,
      { id, name }: { id: string; name: string },
      { loaders }: Context,
    ) => {
      if (!(await loaders.product.load(id))) return null
      await db.products.rename(id, name)
      // The loader still holds the old name for this request: clear it, then reload.
      return loaders.product.clear(id).load(id)
    },
  },
  OrderItem: {
    product: (item: OrderItemRow, _args: unknown, { loaders }: Context) =>
      loaders.product.load(item.productId),
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
