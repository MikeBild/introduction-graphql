import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { createStore, type Store } from './store.ts'

const typeDefs = /* GraphQL */ `
  type Order {
    id: ID!
    totalCents: Int!
    createdAt: String!
  }

  type Query {
    "Newest first. Offset pagination: page through with offset and limit."
    orders(offset: Int = 0, limit: Int = 20): [Order!]!
  }
`

export const createApp = async (store: Store = createStore()) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers: {
      Query: {
        orders: (_parent: unknown, { offset, limit }: { offset: number; limit: number }) =>
          store.list().slice(offset, offset + limit),
      },
    },
  })
  await server.start()
  const app = express()
  app.use('/graphql', express.json(), expressMiddleware(server))
  return app
}
