import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import manifest from '../persisted-documents.json' with { type: 'json' }
import { resolvers, typeDefs } from '../src/schema.ts'
import { costLimitPlugin, maxAliasesRule, maxDepthRule } from './limits.ts'
import { persistedOperations } from './persisted-operations.ts'

const PARTNER_KEY = process.env.PARTNER_KEY ?? 'partner-secret'

export const createApp = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // Limits stay active for everything that runs – also for partners.
    validationRules: [maxDepthRule(5), maxAliasesRule(5)],
    plugins: [costLimitPlugin({ maxCost: 2_000 })],
    // Automatic persisted queries (APQ) are a cache: any client can register any query.
    // The allowlist below replaces them.
    persistedQueries: false,
  })
  await server.start()
  const app = express()
  app.use(
    '/graphql',
    express.json(),
    persistedOperations({
      manifest,
      allowArbitraryOperations: (req) => req.headers['x-partner-key'] === PARTNER_KEY,
    }),
    expressMiddleware(server),
  )
  return app
}
