import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import type { OrderItemRow } from '../src/db.ts'
import { createContext, type Context } from './context.ts'

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

const resolvers = {
  Query: {
    orders: (_parent: unknown, _args: unknown, { loaders }: Context) => loaders.orders.load('all'),
    orderCount: async (_parent: unknown, _args: unknown, { loaders }: Context) =>
      (await loaders.orders.load('all')).length,
    requestId: (_parent: unknown, _args: unknown, { requestId }: Context) => requestId,
  },
  OrderItem: {
    product: (item: OrderItemRow, _args: unknown, { loaders }: Context) =>
      loaders.product.load(item.productId),
  },
}

export const createServer = () => new ApolloServer<Context>({ typeDefs, resolvers })

export const createApp = async () => {
  const server = createServer()
  await server.start()
  const app = express()
  app.use('/graphql', express.json(), expressMiddleware(server, { context: createContext }))
  return app
}
