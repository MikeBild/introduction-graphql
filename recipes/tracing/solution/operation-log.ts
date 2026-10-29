import type { ApolloServerPlugin } from '@apollo/server'
import { log } from '../src/logger.ts'

type OperationMetrics = { count: number; errors: number; totalMs: number }

// Latency and error rate per operation name – the labels a dashboard needs.
export const operationMetrics = new Map<string, OperationMetrics>()

export const operationLogPlugin = (
  write: (line: string) => void = (line) => log.info(line),
): ApolloServerPlugin => ({
  requestDidStart: async () => {
    const startedAt = performance.now()
    return {
      // requestContext.operationName comes from the parsed document, not from the request body.
      willSendResponse: async ({ response, operationName }) => {
        const name = operationName ?? 'anonymous'
        const durationMs = Math.round(performance.now() - startedAt)
        const errorCount =
          response.body.kind === 'single' ? (response.body.singleResult.errors?.length ?? 0) : 0
        const metrics = operationMetrics.get(name) ?? { count: 0, errors: 0, totalMs: 0 }
        operationMetrics.set(name, {
          count: metrics.count + 1,
          errors: metrics.errors + (errorCount > 0 ? 1 : 0),
          totalMs: metrics.totalMs + durationMs,
        })
        write(`[graphql] ${name} ${durationMs}ms errors=${errorCount}`)
      },
    }
  },
})
