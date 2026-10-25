import { GraphQLError } from 'graphql'
import type { CancelResult } from './domain/order-rules.ts'

// Translates domain results into the API language – the only GraphQL-specific part of cancelling.
export const unwrapCancel = (result: CancelResult) => {
  if (result.ok) return result.order
  throw new GraphQLError(
    result.reason === 'NOT_FOUND' ? 'Order not found' : 'Only open orders can be cancelled',
    {
      extensions: { code: result.reason },
    },
  )
}
