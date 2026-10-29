import { readFileSync } from 'node:fs'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { orders, totalCents, type Order } from './orders.ts'

const typeDefs = readFileSync(new URL('../schema/current.graphql', import.meta.url), 'utf8')

const resolvers = {
  Query: { orders: () => orders },
  Order: { total: (order: Order) => totalCents(order) },
}

export const createApp = async () => {
  const server = new ApolloServer({ typeDefs, resolvers })
  await server.start()
  const app = express()
  app.use('/graphql', express.json(), expressMiddleware(server))
  return app
}
