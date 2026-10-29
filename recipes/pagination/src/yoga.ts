import { createSchema, createYoga } from 'graphql-yoga'
import { yogaLogger } from './logger.ts'
import { createStore, type Store } from './store.ts'

const typeDefs = /* GraphQL */ `
  type Order {
    id: ID!
    total: Float!
    createdAt: String!
  }

  type Query {
    "Newest first. Offset pagination: page through with offset and limit."
    orders(offset: Int = 0, limit: Int = 20): [Order!]!
  }
`

export const createApp = (store: Store = createStore()) =>
  createYoga({
    logging: yogaLogger,
    schema: createSchema({
      typeDefs,
      resolvers: {
        Query: {
          orders: (_parent: unknown, { offset, limit }: { offset: number; limit: number }) =>
            store.list().slice(offset, offset + limit),
        },
      },
    }),
  })

export const yoga = createApp()
