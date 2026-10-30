import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { createContext, type Context } from './context.ts'
import { db, type OrderItemRow } from './db.ts'

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

  enum OrderStatus {
    DRAFT
    PLACED
    PAID
    SHIPPED
    CANCELLED
  }

  type Order {
    id: ID!
    status: OrderStatus!
    items: [OrderItem!]!
  }

  input CancelOrderInput {
    orderId: ID!
  }

  type Query {
    "The client decides whose orders it reads."
    orders(customerId: ID!): [Order!]!
  }

  type Mutation {
    cancelOrder(input: CancelOrderInput!): Order
  }
`

const resolvers = {
  Query: {
    orders: (_parent: unknown, args: { customerId: string }) =>
      db.orders.findByCustomer(args.customerId),
  },
  Mutation: {
    cancelOrder: (_parent: unknown, { input }: { input: { orderId: string } }) =>
      db.orders.updateStatus(input.orderId, 'CANCELLED'),
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
