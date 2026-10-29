import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'

export type GraphQLResponse<TData> = {
  status: number
  data?: TData | null
  errors?: { message: string; extensions?: Record<string, unknown> }[]
}

// Starts the HTTP server (and with it the WebSocket server on the same port) on a free port.
export const startTestServer = async (app: { httpServer: Server; stop: () => Promise<void> }) => {
  await new Promise<void>((resolve) => app.httpServer.listen(0, resolve))
  const port = (app.httpServer.address() as AddressInfo).port
  const url = `http://localhost:${port}/graphql`

  const execute = async <TData = Record<string, unknown>>(
    query: string,
    variables: Record<string, unknown> = {},
  ): Promise<GraphQLResponse<TData>> => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    })
    return { status: response.status, ...((await response.json()) as object) }
  }

  // ApolloServer.stop() drains and closes the HTTP server (and, in the solution, the WebSockets).
  return { url, wsUrl: url.replace('http', 'ws'), execute, close: app.stop }
}
