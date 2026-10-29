import { ApolloServer } from '@apollo/server'
import { unwrapResolverError } from '@apollo/server/errors'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { GraphQLError, type GraphQLFormattedError } from 'graphql'
import { log } from '../src/logger.ts'
import { createOrder, customers, missingStock, orders, type Order } from '../src/store.ts'

export type Context = { customerId: string | null }
type PlaceOrderInput = { items: { productId: string; quantity: number }[]; street: string }

type PlaceOrderResult =
  | { __typename: 'PlaceOrderSuccess'; order: Order }
  | { __typename: 'OutOfStock'; productId: string; message: string }
  | { __typename: 'InvalidAddress'; field: string; message: string }

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
    street: String!
  }

  type PlaceOrderSuccess {
    order: Order!
  }

  type OutOfStock {
    productId: ID!
    message: String!
  }

  type InvalidAddress {
    field: String!
    message: String!
  }

  union PlaceOrderResult = PlaceOrderSuccess | OutOfStock | InvalidAddress

  type Query {
    orders: [Order!]!
  }

  type Mutation {
    placeOrder(input: PlaceOrderInput!): PlaceOrderResult!
  }
`

const requireCustomer = ({ customerId }: Context) => {
  if (!customerId)
    throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } })
  return customerId
}

// Expected business failures are values of the schema, not exceptions.
const placeOrder = (input: PlaceOrderInput, customerId: string): PlaceOrderResult => {
  const missing = missingStock(input.items)
  if (missing)
    return {
      __typename: 'OutOfStock',
      productId: missing.productId,
      message: 'Not enough items in stock.',
    }
  if (input.street.trim() === '')
    return { __typename: 'InvalidAddress', field: 'street', message: 'Street must not be empty.' }
  const order = createOrder(customerId, input.items, input.street)
  log.info(`[orders] placed ${order.id} for ${customerId}`)
  return { __typename: 'PlaceOrderSuccess', order }
}

const resolvers = {
  Query: { orders: () => orders },
  Mutation: {
    placeOrder: (_parent: unknown, { input }: { input: PlaceOrderInput }, context: Context) =>
      placeOrder(input, requireCustomer(context)),
  },
  Order: {
    customer: (order: Order) => {
      const customer = customers.get(order.customerId)
      if (!customer) throw new Error(`Customer service timeout for ${order.customerId}`)
      return customer
    },
  },
}

// Technical errors stay in the errors field, but without internal details: log them, mask them.
export const formatError = (formatted: GraphQLFormattedError, error: unknown) => {
  if (unwrapResolverError(error) instanceof GraphQLError) return formatted
  log.error(`[graphql] ${formatted.message}`)
  return { ...formatted, message: 'Internal server error' }
}

export const createApp = async () => {
  const server = new ApolloServer<Context>({ typeDefs, resolvers, formatError })
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
