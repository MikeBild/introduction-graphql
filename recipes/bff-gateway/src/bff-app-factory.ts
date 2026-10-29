import { ApolloServer, type ApolloServerOptions } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import type { Context } from './auth.ts'

// One BFF = one Apollo Server on its own Express app, deployed for one client.
export const createBffApp = async (options: ApolloServerOptions<Context>) => {
  const server = new ApolloServer<Context>(options)
  await server.start()
  const app = express()
  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<Context> => ({
        customerId: req.headers.authorization ?? null,
      }),
    }),
  )
  return app
}
