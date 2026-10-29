import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { db, type OrderItemRow } from './db.ts'

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
`

const resolvers = {
  Query: {
    orders: () => db.orders.findMany(),
  },
  OrderItem: {
    // N+1: one database query per order item.
    product: (item: OrderItemRow) => db.products.findById(item.productId),
  },
}

export const createApp = async () => {
  const server = new ApolloServer({ typeDefs, resolvers })
  await server.start()
  const app = express()
  app.use('/graphql', express.json(), expressMiddleware(server))
  return app
}
