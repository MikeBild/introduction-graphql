export type GraphQLResponse<TData> = {
  data?: TData | null
  errors?: { message: string; path?: (string | number)[]; extensions?: Record<string, unknown> }[]
  extensions?: Record<string, unknown>
}

type FetchHandler = { fetch: (url: string, init: RequestInit) => Promise<Response> | Response }

// Sends a GraphQL request through yoga.fetch, no network or port needed.
export const createTestClient =
  (server: FetchHandler) =>
  async <TData = Record<string, unknown>>(
    query: string,
    variables: Record<string, unknown> = {},
    headers: Record<string, string> = {},
  ): Promise<GraphQLResponse<TData>> => {
    const response = await server.fetch('http://localhost/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify({ query, variables }),
    })
    return (await response.json()) as GraphQLResponse<TData>
  }
