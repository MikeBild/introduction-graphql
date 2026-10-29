import type { ApolloServerPlugin } from '@apollo/server'
import { GraphQLError } from 'graphql'

// Rejects anonymous operations before execution: without a name, logs and traces are useless.
export const requireOperationNamePlugin = (): ApolloServerPlugin => ({
  requestDidStart: async () => ({
    didResolveOperation: async ({ operation }) => {
      if (!operation?.name)
        throw new GraphQLError(
          'Anonymous operations are not allowed. Give your operation a name.',
          {
            extensions: { code: 'ANONYMOUS_OPERATION', http: { status: 400 } },
          },
        )
    },
  }),
})
