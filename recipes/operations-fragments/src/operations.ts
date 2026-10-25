import { readFile } from 'node:fs/promises'
import type { GraphQLResponse } from './test-client.ts'

export const loadOperation = (fileUrl: URL) => readFile(fileUrl, 'utf8')

// Sends a document plus variables and operationName, exactly like a real client.
export const runOperation =
  (yoga: { fetch: (url: string, init: RequestInit) => Promise<Response> | Response }) =>
  async <TData>(
    document: string,
    variables: Record<string, unknown> = {},
    operationName?: string,
  ) => {
    const response = await yoga.fetch('http://localhost/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: document, variables, operationName }),
    })
    return (await response.json()) as GraphQLResponse<TData>
  }
