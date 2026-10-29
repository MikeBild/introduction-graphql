import { ApolloClient, gql, HttpLink, InMemoryCache } from '@apollo/client'
import { relayStylePagination } from '@apollo/client/utilities'

export type OrdersPageData = {
  orders: {
    edges: { cursor: string; node: { id: string } }[]
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
  }
}

export const OrdersPageQuery = gql`
  query OrdersPage($first: Int!, $after: String) {
    orders(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

// relayStylePagination: one cache entry for Query.orders, whatever the cursor –
// fetchMore appends the edges of the next page instead of storing a second list.
export const createClient = (uri: string, onRequest: (operationName: string) => void = () => {}) =>
  new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: { Query: { fields: { orders: relayStylePagination() } } },
    }),
    link: new HttpLink({
      uri,
      fetch: (input, init) => {
        onRequest(JSON.parse(String(init?.body)).operationName)
        return fetch(input, init)
      },
    }),
  })
