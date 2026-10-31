import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import type { Express } from 'express'

export type GraphQLResponse<TData> = {
  status: number
  data?: TData | null
  errors?: { message: string; path?: (string | number)[]; extensions?: Record<string, unknown> }[]
}

// Starts any Express app on a free port: the services behind the graph in tests.
export const startService = async (app: Express) => {
  const server = createServer(app)
  await new Promise<void>((resolve) => server.listen(0, resolve))
  const url = `http://localhost:${(server.address() as AddressInfo).port}`
  const close = () =>
    new Promise<void>((resolve) => {
      server.closeAllConnections()
      server.close(() => resolve())
    })
  return { url, close }
}

// Starts the graph on a free port and sends real HTTP requests to /graphql.
export const startTestServer = async (app: Express) => {
  const service = await startService(app)
  const url = `${service.url}/graphql`

  const execute = async <TData = Record<string, unknown>>(
    query: string,
    variables: Record<string, unknown> = {},
    headers: Record<string, string> = {},
  ): Promise<GraphQLResponse<TData>> => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify({ query, variables }),
    })
    return { status: response.status, ...((await response.json()) as object) }
  }

  return { url, execute, close: service.close }
}
