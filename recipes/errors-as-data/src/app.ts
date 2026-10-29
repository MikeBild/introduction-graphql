import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { GraphQLError } from 'graphql'
import { log } from './logger.ts'
import { createOrder, customers, missingStock, orders, type Order } from './store.ts'

export type Context = { customerId: string | null }
type PlaceOrderInput = { items: { productId: string; quantity: number }[] }

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
  }

  type OrderItem {
    productId: ID!
    quantity: Int!
    priceCents: Int!
  }

  type Order {
    id: ID!
    status: OrderStatus!
    items: [OrderItem!]!
    customer: Customer
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  input PlaceOrderInput {
    items: [OrderItemInput!]!
  }

  type Query {
    orders: [Order!]!
  }

  type Mutation {
    placeOrder(input: PlaceOrderInput!): Order!
  }
`

const requireCustomer = ({ customerId }: Context) => {
  if (!customerId)
    throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } })
  return customerId
}

const resolvers = {
  Query: { orders: () => orders },
  Mutation: {
    placeOrder: (_parent: unknown, { input }: { input: PlaceOrderInput }, context: Context) => {
      const customerId = requireCustomer(context)
      // Expected business failures thrown as plain errors: the client only sees a technical error.
      if (input.items.length === 0) throw new Error('An order needs at least one item')
      const missing = missingStock(input.items)
      if (missing) throw new Error(`Product ${missing.productId} is out of stock`)
      const order = createOrder(customerId, input.items)
      log.info(`[orders] placed ${order.id} for ${customerId}`)
      return order
    },
  },
  Order: {
    customer: (order: Order) => {
      // Simulates an unreachable customer service for unknown customers.
      const customer = customers.get(order.customerId)
      if (!customer) throw new Error(`Customer service timeout for ${order.customerId}`)
      return customer
    },
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
      context: async ({ req }): Promise<Context> => ({
        customerId: req.headers.authorization ?? null,
      }),
    }),
  )
  return app
}
