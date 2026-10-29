import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { Kind, OperationTypeNode } from 'graphql'
import { createClient } from 'graphql-ws'

// Subscriptions go over the WebSocket, everything else over HTTP.
export const createShopClient = (httpUrl: string, wsUrl: string) => {
  const ws = createClient({ url: wsUrl })
  const link = ApolloLink.split(
    ({ query }) =>
      query.definitions.some(
        (definition) =>
          definition.kind === Kind.OPERATION_DEFINITION &&
          definition.operation === OperationTypeNode.SUBSCRIPTION,
      ),
    new GraphQLWsLink(ws),
    new HttpLink({ uri: httpUrl }),
  )
  const client = new ApolloClient({ link, cache: new InMemoryCache() })
  return { client, dispose: () => ws.dispose() }
}
