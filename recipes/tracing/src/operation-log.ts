import type { ApolloServerPlugin } from '@apollo/server'
import { log } from './logger.ts'

// Logs duration and error count per operation name – not per HTTP path.
export const operationLogPlugin = (
  write: (line: string) => void = (line) => log.info(line),
): ApolloServerPlugin => ({
  requestDidStart: async ({ request }) => {
    const startedAt = performance.now()
    return {
      willSendResponse: async ({ response }) => {
        const errors = response.body.kind === 'single' ? response.body.singleResult.errors : []
        // request.operationName is only what the client sent along.
        write(
          `[graphql] ${request.operationName ?? 'anonymous'} ${Math.round(performance.now() - startedAt)}ms errors=${errors?.length ?? 0}`,
        )
      },
    }
  },
})
