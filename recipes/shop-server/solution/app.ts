import { readFileSync } from 'node:fs'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { GraphQLError } from 'graphql'
import {
  customers,
  findOrder,
  findProduct,
  orders,
  placeOrder,
  products,
  totalCents,
  verifyToken,
  type Customer,
  type Order,
  type OrderItem,
} from '../src/data.ts'

export type Context = { user: Customer | null }

const typeDefs = readFileSync(new URL('./schema.graphql', import.meta.url), 'utf8')

const requireUser = (user: Customer | null) => {
  if (!user)
    throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } })
  return user
}

const newestFirst = (a: Order, b: Order) => b.createdAt.localeCompare(a.createdAt)

// Business rule: CANCELLED only from DRAFT or PLACED, and only by the customer who ordered.
const cancelOrder = (user: Customer, orderId: string) => {
  const order = findOrder(orderId)
  if (!order) throw new GraphQLError('Order not found', { extensions: { code: 'NOT_FOUND' } })
  if (order.customerId !== user.id)
    throw new GraphQLError('Not your order', { extensions: { code: 'FORBIDDEN' } })
  if (order.status !== 'DRAFT' && order.status !== 'PLACED')
    throw new GraphQLError(`An order in status ${order.status} cannot be cancelled`, {
      extensions: { code: 'NOT_CANCELLABLE' },
    })
  order.status = 'CANCELLED'
  return order
}

const resolvers = {
  Query: {
    products: () => products,
    orders: (_parent: unknown, { status }: { status?: Order['status'] | null }) =>
      orders.filter((order) => !status || order.status === status).toSorted(newestFirst),
    order: (_parent: unknown, { id }: { id: string }) => findOrder(id) ?? null,
    customer: (_parent: unknown, { id }: { id: string }) =>
      customers.find((customer) => customer.id === id) ?? null,
  },
  Mutation: {
    placeOrder: (
      _parent: unknown,
      { input }: { input: { items: { productId: string; quantity: number }[] } },
      { user }: Context,
    ) => {
      const result = placeOrder(requireUser(user).id, input.items)
      if ('code' in result)
        throw new GraphQLError(result.message, { extensions: { code: result.code } })
      return { order: result }
    },
    cancelOrder: (
      _parent: unknown,
      { input }: { input: { orderId: string } },
      { user }: Context,
    ) => ({ order: cancelOrder(requireUser(user), input.orderId) }),
  },
  Order: {
    totalCents: (order: Order) => totalCents(order),
    customer: (order: Order) => customers.find((customer) => customer.id === order.customerId),
  },
  OrderItem: {
    product: (item: OrderItem) => findProduct(item.productId),
  },
  Customer: {
    orders: (customer: Customer) =>
      orders.filter((order) => order.customerId === customer.id).toSorted(newestFirst),
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
        user: verifyToken(req.headers.authorization ?? null),
      }),
    }),
  )
  return app
}
