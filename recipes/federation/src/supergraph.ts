import { createServer, type RequestListener } from 'node:http'
import type { AddressInfo } from 'node:net'
import { composeServices } from '@apollo/composition'
import { ApolloGateway } from '@apollo/gateway'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import type { DocumentNode } from 'graphql'
import { log } from './logger.ts'

export type Subgraph = { name: string; typeDefs: DocumentNode; url: string }

// Composition: in a real setup this runs in CI or in a schema registry (rover), not at runtime.
export const composeSupergraph = (subgraphs: Subgraph[]) => {
  const result = composeServices(subgraphs)
  if (result.errors) {
    result.errors.forEach((error) => log.error(`[compose] ${error.message}`))
    throw new Error(`Composition failed with ${result.errors.length} error(s)`)
  }
  log.debug(`[compose] composed ${subgraphs.map((subgraph) => subgraph.name).join(', ')}`)
  return result.supergraphSdl
}

// Apollo Gateway plans every query across the subgraphs named in the supergraph.
export const createGateway = async (supergraphSdl: string) => {
  const server = new ApolloServer({ gateway: new ApolloGateway({ supergraphSdl }) })
  await server.start()
  const app = express()
  app.use('/graphql', express.json(), expressMiddleware(server))
  return { app, stop: () => server.stop() }
}

// Serves a subgraph from its schema – each team runs its own Apollo Server on Express.
export const createSubgraphApp = async (schema: ConstructorParameters<typeof ApolloServer>[0]) => {
  const server = new ApolloServer(schema)
  await server.start()
  const app = express()
  app.use('/graphql', express.json(), expressMiddleware(server))
  return app
}

export const listen = (handler: RequestListener, port = 0) =>
  new Promise<{ url: string; close: () => void }>((resolve) => {
    const server = createServer(handler).listen(port, () =>
      resolve({
        url: `http://localhost:${(server.address() as AddressInfo).port}/graphql`,
        close: () => server.close(),
      }),
    )
  })
