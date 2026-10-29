import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'

// Every request asks for the current access token and sends it as a bearer token.
// In the browser, getAccessToken comes from your OIDC library (it also refreshes the token).
export const createShopClient = (uri: string, getAccessToken: () => Promise<string | null>) => {
  const authLink = new SetContextLink(async ({ headers }) => {
    const token = await getAccessToken()
    return { headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) } }
  })
  return new ApolloClient({
    link: authLink.concat(new HttpLink({ uri })),
    cache: new InMemoryCache(),
  })
}
