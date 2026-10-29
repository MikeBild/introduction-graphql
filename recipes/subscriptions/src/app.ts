import { createServer } from 'node:http'
import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { createOrders } from './data.ts'

const typeDefs = /* GraphQL */ `
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
    totalCents: Int!
  }

  type Query {
    order(id: ID!): Order
  }

  type Mutation {
    payOrder(id: ID!): Order!
    shipOrder(id: ID!): Order!
  }
`

// HTTP only: a client that wants to see a new status has to ask again and again (polling).
export const createApp = async () => {
  const orders = createOrders()
  const app = express()
  const httpServer = createServer(app)
  const server = new ApolloServer({
    typeDefs,
    resolvers: {
      Query: { order: (_parent: unknown, { id }: { id: string }) => orders.find(id) ?? null },
      Mutation: {
        payOrder: (_parent: unknown, { id }: { id: string }) => orders.pay(id),
        shipOrder: (_parent: unknown, { id }: { id: string }) => orders.ship(id),
      },
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  })
  await server.start()
  app.use('/graphql', express.json(), expressMiddleware(server))
  return { httpServer, stop: () => server.stop() }
}
