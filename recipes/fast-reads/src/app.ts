import { readFileSync } from 'node:fs'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import type { Db, OrderItemRow, OrderRow } from './db.ts'

const typeDefs = readFileSync(new URL('./schema.graphql', import.meta.url), 'utf8')

const MAX_FIRST = 100

type Context = { db: Db }

const totalCents = (items: readonly OrderItemRow[]) =>
  items.reduce((sum, { quantity, price_cents }) => sum + quantity * price_cents, 0)

const resolvers = {
  Query: {
    // The database walks past every skipped row, and new orders shift the pages.
    orders: (
      _parent: unknown,
      { first, offset }: { first: number; offset: number },
      { db }: Context,
    ) => db.orders.page(Math.min(first, MAX_FIRST), offset),
  },
  Order: {
    createdAt: (order: OrderRow) => order.created_at,
    // One query per order, and totalCents asks the same question again.
    items: (order: OrderRow, _args: unknown, { db }: Context) => db.items.ofOrder(order.id),
    totalCents: async (order: OrderRow, _args: unknown, { db }: Context) =>
      totalCents(await db.items.ofOrder(order.id)),
  },
  OrderItem: {
    priceCents: (item: OrderItemRow) => item.price_cents,
    // One query per line item, even when ten lines show the same product.
    product: (item: OrderItemRow, _args: unknown, { db }: Context) =>
      db.products.findById(item.product_id),
  },
  Product: {
    priceCents: (product: { price_cents: number }) => product.price_cents,
  },
}

export const createApp = async (db: Db) => {
  const server = new ApolloServer<Context>({ typeDefs, resolvers })
  await server.start()
  const app = express()
  app.use('/graphql', express.json(), expressMiddleware(server, { context: async () => ({ db }) }))
  // For src/load.ts: the database accesses so far.
  app.get('/stats', (_request, response) => {
    response.json({ queries: db.queries() })
  })
  return app
}
