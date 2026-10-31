import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { createContext, type Config, type Context } from './context.ts'
import { resolvers, typeDefs } from './schema.ts'

export const createApp = async (config: Config) => {
  const server = new ApolloServer<Context>({ typeDefs, resolvers })
  await server.start()
  const app = express()
  app.use('/graphql', express.json(), expressMiddleware(server, { context: createContext(config) }))
  return app
}
