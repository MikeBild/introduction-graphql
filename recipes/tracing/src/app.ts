import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { operationLogPlugin } from './operation-log.ts'
import { resolvers, typeDefs } from './schema.ts'

export const createApp = async (write?: (line: string) => void) => {
  const server = new ApolloServer({ typeDefs, resolvers, plugins: [operationLogPlugin(write)] })
  await server.start()
  const app = express()
  app.use('/graphql', express.json(), expressMiddleware(server))
  return app
}
