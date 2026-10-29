import { ApolloServer } from '@apollo/server'
import responseCachePlugin from '@apollo/server-plugin-response-cache'
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { createResolvers, type Context } from '../src/schema.ts'

// Cache hints in the schema: Apollo computes the policy of a whole response from its fields –
// the smallest maxAge wins, a single PRIVATE field makes the response PRIVATE.
// Root fields and fields returning objects default to maxAge 0, so they need a hint.
const typeDefs = /* GraphQL */ `
  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }

  directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope
    inheritMaxAge: Boolean
  ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

  type Product @cacheControl(maxAge: 60) {
    id: ID!
    name: String!
    priceCents: Int!
    stock: Int! @cacheControl(maxAge: 10)
  }

  type Viewer @cacheControl(maxAge: 30, scope: PRIVATE) {
    id: ID!
    cart: [Product!]!
  }

  type Query {
    products: [Product!]! @cacheControl(maxAge: 60)
    me: Viewer
  }

  type Mutation {
    updatePrice(id: ID!, priceCents: Int!): Product
  }
`

export const createApp = async () => {
  // The response cache knows only TTLs, no invalidation. With a cache of our own,
  // a mutation can throw away what is outdated.
  const responseCache = new InMemoryLRUCache()
  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers: createResolvers({ onProductChanged: () => responseCache.clear() }),
    plugins: [
      responseCachePlugin({
        cache: responseCache,
        // Separates users: PRIVATE answers are cached per session only.
        sessionId: async ({ contextValue }) => contextValue.userId,
      }),
    ],
  })
  await server.start()
  const app = express()
  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<Context> => ({ userId: req.headers.authorization ?? null }),
    }),
  )
  return app
}
