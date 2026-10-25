import { readFileSync } from 'node:fs'
import { createSchema, createYoga } from 'graphql-yoga'
import { yogaLogger } from '../src/logger.ts'
import { orders, type Order } from '../src/orders.ts'
import { useDeprecatedFieldUsage } from './deprecated-usage.ts'

const typeDefs = readFileSync(new URL('./schema/current.graphql', import.meta.url), 'utf8')

export const yoga = createYoga({
  logging: yogaLogger,
  plugins: [useDeprecatedFieldUsage()],
  schema: createSchema({
    typeDefs,
    resolvers: {
      Query: { orders: () => orders },
      Order: {
        total: (order: Order) => order.totalCents / 100,
        totalPrice: (order: Order) => ({
          amount: (order.totalCents / 100).toFixed(2),
          currency: order.currency,
        }),
      },
    },
  }),
})
