import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { GraphQLError } from 'graphql'
import { createContext, type Context, type Viewer } from '../src/context.ts'
import type { OrderItemRow, OrderRow } from '../src/db.ts'
import { canCancel, cancelOrder, listOrders } from './logic.ts'

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
    "Whether whoever asks may cancel this order right now"
    viewerCanCancel: Boolean!
  }

  "Whoever asks. There is no argument: foreign data cannot be addressed."
  type Viewer {
    id: ID!
    name: String!
    orders: [Order!]!
  }

  type CancelOrderSuccess {
    order: Order!
  }

  type OrderNotCancellable {
    orderId: ID!
    message: String!
  }

  union CancelOrderResult = CancelOrderSuccess | OrderNotCancellable

  input CancelOrderInput {
    orderId: ID!
  }

  type Query {
    "null without a sign-in"
    me: Viewer
  }

  type Mutation {
    cancelOrder(input: CancelOrderInput!): CancelOrderResult!
  }
`

const requireViewer = ({ viewer }: Context) => {
  if (viewer) return viewer
  throw new GraphQLError('Sign in first.', { extensions: { code: 'UNAUTHENTICATED' } })
}

const resolvers = {
  Query: {
    me: (_parent: unknown, _args: unknown, { viewer }: Context) => viewer,
  },
  Viewer: {
    // The parent is the viewer from the context, see Query.me.
    orders: (viewer: Viewer) => listOrders(viewer),
  },
  Order: {
    viewerCanCancel: (order: OrderRow, _args: unknown, { viewer }: Context) =>
      viewer !== null && canCancel(viewer, order),
  },
  OrderItem: {
    product: (item: OrderItemRow, _args: unknown, { loaders }: Context) =>
      loaders.product.load(item.productId),
  },
  Mutation: {
    cancelOrder: async (
      _parent: unknown,
      { input }: { input: { orderId: string } },
      context: Context,
    ) => {
      const order = await cancelOrder(requireViewer(context), input.orderId)
      if (order) return { __typename: 'CancelOrderSuccess', order }
      // Same answer for missing and foreign orders: it must not reveal that an order exists.
      return {
        __typename: 'OrderNotCancellable',
        orderId: input.orderId,
        message: `Order ${input.orderId} cannot be cancelled.`,
      }
    },
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
