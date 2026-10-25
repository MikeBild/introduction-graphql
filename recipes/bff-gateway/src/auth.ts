import { GraphQLError } from 'graphql'
import type { YogaInitialContext } from 'graphql-yoga'

// Stand-in for authentication: the customer id comes from the Authorization header.
// In production derive it from a verified token (signature, iss, aud, exp) – see introduction-nodejs EXAMPLES/AUTH/jwt-oidc.
export const customerIdOf = ({ request }: YogaInitialContext) => {
  const customerId = request.headers.get('authorization')
  if (!customerId)
    throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } })
  return customerId
}

// Foreign orders look exactly like missing ones – nothing reveals that they exist
export const notFound = () =>
  new GraphQLError('Order not found', { extensions: { code: 'NOT_FOUND' } })
