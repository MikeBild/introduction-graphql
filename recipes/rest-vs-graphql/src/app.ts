import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { findCustomer, orders, type Order, type OrderStatus } from './data.ts'
import { restRouter } from './rest.ts'

const typeDefs = /* GraphQL */ `
  enum OrderStatus {
    DRAFT
    PLACED
    PAID
    SHIPPED
    CANCELLED
  }

  type Customer {
    id: ID!
    name: String!
    email: String!
  }

  type OrderItem {
    productId: ID!
    quantity: Int!
    priceCents: Int!
  }

  type Order {
    id: ID!
    status: OrderStatus!
    createdAt: String!
    customer: Customer!
    items: [OrderItem!]!
  }

  type Query {
    orders(status: OrderStatus): [Order!]!
  }
`

const resolvers = {
  Query: {
    orders: (_parent: unknown, { status }: { status?: OrderStatus | null }) =>
      status ? orders.filter((order) => order.status === status) : orders,
  },
  Order: {
    customer: (order: Order) => findCustomer(order.customerId),
  },
}

// One Express 5 app: REST routes and the GraphQL endpoint side by side.
export const createApp = async () => {
  const server = new ApolloServer({ typeDefs, resolvers })
  await server.start()
  const app = express()
  app.use('/api', restRouter)
  app.use('/graphql', express.json(), expressMiddleware(server))
  return app
}
