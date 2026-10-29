import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { createResolvers, typeDefs, type Context } from './schema.ts'

// Starting point: every request goes to the database.
export const createApp = async () => {
  const server = new ApolloServer<Context>({ typeDefs, resolvers: createResolvers() })
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
