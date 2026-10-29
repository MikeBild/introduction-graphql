import { ApolloClient, HttpLink, InMemoryCache, type DocumentNode } from '@apollo/client'

// A network between client and server you can inspect and pause: it records the operation
// name of every request and, while held, keeps the server responses back.
export const createNetwork = (url: string) => {
  const requests: string[] = []
  let gate: Promise<void> | undefined
  let open = () => {}
  return {
    requests,
    hold: () => {
      gate = new Promise((resolve) => (open = resolve))
    },
    release: () => {
      gate = undefined
      open()
    },
    fetch: async (_input: RequestInfo | URL, init: RequestInit = {}) => {
      requests.push(JSON.parse(String(init.body)).operationName)
      const response = await fetch(url, init)
      await gate
      return response
    },
  }
}

export const createClient = (network: ReturnType<typeof createNetwork>) =>
  new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({ fetch: network.fetch }),
  })

// Stands in for a component: subscribes to a query and keeps the latest data, like useQuery.
export const watch = <TData>(
  client: ApolloClient,
  query: DocumentNode,
  variables: Record<string, unknown> = {},
) => {
  let latest: TData | undefined
  const subscription = client
    .watchQuery<TData>({ query, variables })
    .subscribe((result) => (latest = result.data as TData | undefined))
  return { current: () => latest, stop: () => subscription.unsubscribe() }
}
