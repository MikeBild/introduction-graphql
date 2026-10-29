import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

// Vite proxies /graphql to the server recipe on port 4000.
export const createClient = (uri = '/graphql') =>
  new ApolloClient({ cache: new InMemoryCache(), link: new HttpLink({ uri }) })
