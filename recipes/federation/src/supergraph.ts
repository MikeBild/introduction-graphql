import { createServer, type RequestListener } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createGatewayRuntime } from '@graphql-hive/gateway-runtime'
import { composeServices } from '@theguild/federation-composition'
import type { DocumentNode } from 'graphql'
import { log, yogaLogger } from './logger.ts'

export type Subgraph = { name: string; typeDefs: DocumentNode; url: string }

// Composition: in a real setup this runs in CI or in a schema registry, not at runtime.
export const composeSupergraph = (subgraphs: Subgraph[]) => {
  const result = composeServices(subgraphs)
  if (!result.supergraphSdl) {
    const errors = result.errors ?? []
    errors.forEach((error) => log.error(`[compose] ${error.message}`))
    throw new Error(`Composition failed with ${errors.length} error(s)`)
  }
  log.debug(`[compose] composed ${subgraphs.map((subgraph) => subgraph.name).join(', ')}`)
  return result.supergraphSdl
}

export const createGateway = (supergraphSdl: string) =>
  createGatewayRuntime({ supergraph: supergraphSdl, logging: yogaLogger })

export const listen = (handler: RequestListener, port = 0) =>
  new Promise<{ url: string; close: () => void }>((resolve) => {
    const server = createServer(handler).listen(port, () =>
      resolve({
        url: `http://localhost:${(server.address() as AddressInfo).port}/graphql`,
        close: () => server.close(),
      }),
    )
  })
