import { ApolloClient, createNetworkInterface } from 'react-apollo'
let apolloClient = null

function create (initialState) {
  return new ApolloClient({
    initialState,
    ssrMode: !process.env.BROWSER,
    networkInterface: createNetworkInterface({uri: 'http://localhost:3000/graphql'})
  })
}

export default function initApollo (initialState) {
  if (!process.env.BROWSER) return create(initialState)
  if (!apolloClient) apolloClient = create(initialState)

  return apolloClient
}