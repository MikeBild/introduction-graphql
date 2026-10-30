import { readFileSync } from 'node:fs'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { GraphQLError } from 'graphql'
import { decodeCursor, encodeCursor } from '../src/cursor.ts'
import type { OrderItemRow, OrderRow } from '../src/db.ts'
import type { FastDb } from './db.ts'
import { createLoaders, type Loaders } from './loaders.ts'

const typeDefs = readFileSync(new URL('./schema.graphql', import.meta.url), 'utf8')

const MAX_FIRST = 100

type Context = { db: FastDb; loaders: Loaders }

const totalCents = (items: readonly OrderItemRow[]) =>
  items.reduce((sum, { quantity, price_cents }) => sum + quantity * price_cents, 0)

const readCursor = (after: string | null | undefined) => {
  if (!after) return null
  const cursor = decodeCursor(after)
  if (cursor) return cursor
  throw new GraphQLError('Invalid cursor', { extensions: { code: 'BAD_USER_INPUT' } })
}

const orderCursor = ({ created_at, id }: OrderRow) => encodeCursor({ createdAt: created_at, id })

const resolvers = {
  Query: {
    orders: async (
      _parent: unknown,
      { first, after }: { first: number; after?: string | null },
      { db }: Context,
    ) => {
      const limit = Math.min(first, MAX_FIRST)
      // One row more than asked for tells whether there is a next page.
      const rows = await db.orders.after(readCursor(after), limit + 1)
      const edges = rows.slice(0, limit).map((node) => ({ node, cursor: orderCursor(node) }))
      return {
        edges,
        pageInfo: {
          hasNextPage: rows.length > limit,
          endCursor: edges.at(-1)?.cursor ?? null,
        },
      }
    },
  },
  Order: {
    createdAt: (order: OrderRow) => order.created_at,
    items: (order: OrderRow, _args: unknown, { loaders }: Context) =>
      loaders.itemsOfOrder.load(order.id),
    totalCents: async (order: OrderRow, _args: unknown, { loaders }: Context) =>
      totalCents(await loaders.itemsOfOrder.load(order.id)),
  },
  OrderItem: {
    priceCents: (item: OrderItemRow) => item.price_cents,
    product: (item: OrderItemRow, _args: unknown, { loaders }: Context) =>
      loaders.product.load(item.product_id),
  },
  Product: {
    priceCents: (product: { price_cents: number }) => product.price_cents,
  },
}

export const createApp = async (db: FastDb) => {
  const server = new ApolloServer<Context>({ typeDefs, resolvers })
  await server.start()
  const app = express()
  app.use(
    '/graphql',
    express.json(),
    // Fresh loaders per request: their cache must not outlive it.
    expressMiddleware(server, { context: async () => ({ db, loaders: createLoaders(db) }) }),
  )
  app.get('/stats', (_request, response) => {
    response.json({ queries: db.queries() })
  })
  return app
}
