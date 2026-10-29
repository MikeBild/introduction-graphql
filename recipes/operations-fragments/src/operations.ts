import { readFile } from 'node:fs/promises'
import type { GraphQLResponse } from './test-client.ts'

export const loadOperation = (fileUrl: URL) => readFile(fileUrl, 'utf8')

// Sends a document plus variables and operationName, exactly like a real client.
export const runOperation =
  (url: string) =>
  async <TData>(
    document: string,
    variables: Record<string, unknown> = {},
    operationName?: string,
  ): Promise<GraphQLResponse<TData>> => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: document, variables, operationName }),
    })
    return { status: response.status, ...((await response.json()) as object) }
  }
