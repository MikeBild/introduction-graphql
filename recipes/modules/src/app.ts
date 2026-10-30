import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import DataLoader from 'dataloader'
import express, { type Request } from 'express'
import { GraphQLError } from 'graphql'
import { db, type OrderItemRow, type OrderRow, type ProductRow } from './db.ts'

// Everything lives here: schema, validation, permissions, business rules and data access.
const typeDefs = /* GraphQL */ `
  type Product {
    id: ID!
    name: String!
    priceCents: Int!
    inStock: Boolean!
  }

  type OrderItem {
    quantity: Int!
    priceCents: Int!
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
    totalCents: Int!
  }

  type ChangeOrderItemsSuccess {
    order: Order!
  }

  type OrderNotFound {
    orderId: ID!
    message: String!
  }

  type OrderNotEditable {
    orderId: ID!
    status: OrderStatus!
    message: String!
  }

  union ChangeOrderItemsResult = ChangeOrderItemsSuccess | OrderNotFound | OrderNotEditable

  input ChangeOrderItemQuantityInput {
    orderId: ID!
    productId: ID!
    quantity: Int!
  }

  input RemoveOrderItemInput {
    orderId: ID!
    productId: ID!
  }

  type Query {
    products: [Product!]!
    "The orders of the signed-in customer"
    orders: [Order!]!
  }

  type Mutation {
    changeOrderItemQuantity(input: ChangeOrderItemQuantityInput!): ChangeOrderItemsResult!
    removeOrderItem(input: RemoveOrderItemInput!): ChangeOrderItemsResult!
  }
`

type Context = Readonly<{
  viewer: { id: string } | null
  loaders: { product: DataLoader<string, ProductRow | null> }
}>

const createLoaders = (): Context['loaders'] => ({
  product: new DataLoader(async (ids: readonly string[]) => {
    const rows = await db.products.findByIds(ids)
    const byId = new Map(rows.map((row) => [row.id, row]))
    return ids.map((id) => byId.get(id) ?? null)
  }),
})

const createContext = async ({ req }: { req: Request }): Promise<Context> => {
  const customerId = req.get('x-customer-id')
  return Object.freeze({
    viewer: customerId ? { id: customerId } : null,
    loaders: createLoaders(),
  })
}

const orderNotFound = (orderId: string) => ({
  __typename: 'OrderNotFound',
  orderId,
  message: `Order ${orderId} does not exist.`,
})

const resolvers = {
  Query: {
    products: () => db.products.findMany(),
    orders: (_parent: unknown, _args: unknown, { viewer }: Context) => {
      if (!viewer)
        throw new GraphQLError('Sign in first.', { extensions: { code: 'UNAUTHENTICATED' } })
      return db.orders.findByCustomer(viewer.id)
    },
  },
  Mutation: {
    changeOrderItemQuantity: async (
      _parent: unknown,
      { input }: { input: { orderId: string; productId: string; quantity: number } },
      { viewer }: Context,
    ) => {
      if (!viewer)
        throw new GraphQLError('Sign in first.', { extensions: { code: 'UNAUTHENTICATED' } })
      if (input.quantity < 1)
        throw new GraphQLError('Quantity must be at least 1.', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      const order = await db.orders.findById(input.orderId)
      if (!order || order.customerId !== viewer.id) return orderNotFound(input.orderId)
      if (order.status !== 'DRAFT')
        return {
          __typename: 'OrderNotEditable',
          orderId: order.id,
          status: order.status,
          message: `Order ${order.id} is ${order.status} and can no longer be changed.`,
        }
      const items = order.items.map((item) =>
        item.productId === input.productId ? { ...item, quantity: input.quantity } : item,
      )
      return {
        __typename: 'ChangeOrderItemsSuccess',
        order: await db.orders.saveItems(order.id, items),
      }
    },
    // Written later, by someone who did not read the resolver above.
    removeOrderItem: async (
      _parent: unknown,
      { input }: { input: { orderId: string; productId: string } },
    ) => {
      const order = await db.orders.findById(input.orderId)
      if (!order) return orderNotFound(input.orderId)
      const items = order.items.filter((item) => item.productId !== input.productId)
      return {
        __typename: 'ChangeOrderItemsSuccess',
        order: await db.orders.saveItems(order.id, items),
      }
    },
  },
  Product: {
    inStock: (product: ProductRow) => product.stock > 0,
  },
  OrderItem: {
    product: (item: OrderItemRow, _args: unknown, { loaders }: Context) =>
      loaders.product.load(item.productId),
  },
  Order: {
    totalCents: (order: OrderRow) =>
      order.items.reduce((sum, item) => sum + item.quantity * item.priceCents, 0),
  },
}

export const createApp = async () => {
  const server = new ApolloServer<Context>({ typeDefs, resolvers })
  await server.start()
  const app = express()
  app.use('/graphql', express.json(), expressMiddleware(server, { context: createContext }))
  return app
}
