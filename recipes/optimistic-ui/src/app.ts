import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { GraphQLError } from 'graphql'
import { log } from './logger.ts'

export type OrderStatus = 'OPEN' | 'SHIPPED' | 'CANCELLED'
export type Order = { id: string; total: number; status: OrderStatus }

const typeDefs = /* GraphQL */ `
  enum OrderStatus {
    OPEN
    SHIPPED
    CANCELLED
  }

  type Order {
    id: ID!
    total: Float!
    status: OrderStatus!
  }

  input CancelOrderInput {
    orderId: ID!
  }

  type CancelOrderPayload {
    order: Order!
  }

  type Query {
    orders: [Order!]!
    order(id: ID!): Order
  }

  type Mutation {
    cancelOrder(input: CancelOrderInput!): CancelOrderPayload!
  }
`

// One app per call, each with its own data – tests do not share state.
export const createApp = async () => {
  const orders: Order[] = [
    { id: 'o-1', total: 42, status: 'OPEN' },
    { id: 'o-2', total: 17, status: 'OPEN' },
    { id: 'o-3', total: 99, status: 'SHIPPED' },
  ]
  const server = new ApolloServer({
    typeDefs,
    resolvers: {
      Query: {
        orders: () => orders,
        order: (_parent: unknown, { id }: { id: string }) =>
          orders.find((order) => order.id === id) ?? null,
      },
      Mutation: {
        cancelOrder: (_parent: unknown, { input }: { input: { orderId: string } }) => {
          const order = orders.find((candidate) => candidate.id === input.orderId)
          if (!order)
            throw new GraphQLError('Order not found', { extensions: { code: 'NOT_FOUND' } })
          if (order.status !== 'OPEN')
            throw new GraphQLError(`Order ${order.id} is ${order.status}`, {
              extensions: { code: 'NOT_CANCELLABLE' },
            })
          order.status = 'CANCELLED'
          log.info(`[orders] cancelled ${order.id}`)
          return { order }
        },
      },
    },
  })
  await server.start()
  const app = express()
  app.use('/graphql', express.json(), expressMiddleware(server))
  return app
}
