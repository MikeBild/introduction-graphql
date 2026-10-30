import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { createContext, type Context } from './context.ts'
import { resolvers, typeDefs } from './schema.ts'

export const createServer = () => new ApolloServer<Context>({ typeDefs, resolvers })

export const createApp = async () => {
  const server = createServer()
  await server.start()
  const app = express()
  app.use('/graphql', express.json(), expressMiddleware(server, { context: createContext }))
  return app
}
