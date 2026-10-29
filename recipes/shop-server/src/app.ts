import { readFileSync } from 'node:fs'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { GraphQLError } from 'graphql'
import {
  findOrder,
  orders,
  placeOrder,
  totalCents,
  verifyToken,
  type Customer,
  type Order,
} from './data.ts'

export type Context = { user: Customer | null }

// The schema lives in its own file: SDL first, resolvers second.
const typeDefs = readFileSync(new URL('./schema.graphql', import.meta.url), 'utf8')

const requireUser = (user: Customer | null) => {
  if (!user)
    throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } })
  return user
}

const resolvers = {
  Query: {
    // TODO: answer Query.products – right now nothing resolves it.
    orders: (_parent: unknown, { status }: { status?: Order['status'] | null }) =>
      status ? orders.filter((order) => order.status === status) : orders,
    order: (_parent: unknown, { id }: { id: string }) => findOrder(id) ?? null,
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
  },
  Order: {
    totalCents: (order: Order) => totalCents(order),
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
