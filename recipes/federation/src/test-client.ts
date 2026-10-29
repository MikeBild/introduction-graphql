export type GraphQLResponse<TData> = {
  status: number
  data?: TData | null
  errors?: { message: string; path?: (string | number)[]; extensions?: Record<string, unknown> }[]
}

// Sends a GraphQL request over HTTP to a running server.
export const createTestClient =
  (url: string) =>
  async <TData = Record<string, unknown>>(
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
