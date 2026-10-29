import { createServer } from 'node:http'
import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { expressMiddleware } from '@as-integrations/express5'
import { makeExecutableSchema } from '@graphql-tools/schema'
import express from 'express'
import { PubSub, withFilter } from 'graphql-subscriptions'
import { useServer } from 'graphql-ws/use/ws'
import { WebSocketServer } from 'ws'
import { createOrders, type Order } from '../src/data.ts'
import { log } from '../src/logger.ts'

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

  type Subscription {
    "Fires whenever the status of this order changes"
    orderStatusChanged(orderId: ID!): Order!
  }
`

export const createApp = async () => {
  const orders = createOrders()
  // In memory, one process. With several server instances, swap in an external PubSub
  // (e.g. Redis) behind the same publish / asyncIterableIterator interface.
  const pubsub = new PubSub<{ ORDER_STATUS_CHANGED: Order }>()

  // After the business logic has decided: publish the changed order.
  const publishing =
    (change: (id: string) => Order) =>
    async (_parent: unknown, { id }: { id: string }) => {
      const order = change(id)
      await pubsub.publish('ORDER_STATUS_CHANGED', { ...order })
      return order
    }

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers: {
      Query: { order: (_parent: unknown, { id }: { id: string }) => orders.find(id) ?? null },
      Mutation: { payOrder: publishing(orders.pay), shipOrder: publishing(orders.ship) },
      Subscription: {
        orderStatusChanged: {
          subscribe: withFilter(
            () => pubsub.asyncIterableIterator('ORDER_STATUS_CHANGED'),
            (order?: Order, args?: { orderId: string }) => order?.id === args?.orderId,
          ),
          resolve: (order: Order) => order,
        },
      },
    },
  })

  const app = express()
  const httpServer = createServer(app)
  // Queries and mutations over HTTP, subscriptions over WebSocket – same port, same path.
  const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' })
  const wsCleanup = useServer(
    {
      schema,
      onSubscribe: (_ctx, id) => log.debug(`[ws] subscribe ${id}`),
    },
    wsServer,
  )

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Close all WebSocket connections on shutdown, too.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await wsCleanup.dispose()
            },
          }
        },
      },
    ],
  })
  await server.start()
  app.use('/graphql', express.json(), expressMiddleware(server))
  return { httpServer, stop: () => server.stop() }
}
