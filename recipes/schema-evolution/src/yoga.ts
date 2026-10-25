import { readFileSync } from 'node:fs'
import { createSchema, createYoga } from 'graphql-yoga'
import { yogaLogger } from './logger.ts'
import { orders, type Order } from './orders.ts'

const typeDefs = readFileSync(new URL('../schema/current.graphql', import.meta.url), 'utf8')

export const yoga = createYoga({
  logging: yogaLogger,
  schema: createSchema({
    typeDefs,
    resolvers: {
      Query: { orders: () => orders },
      Order: { total: (order: Order) => order.totalCents / 100 },
    },
  }),
})
