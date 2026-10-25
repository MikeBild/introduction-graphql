import { getOperationAST, type DocumentNode } from 'graphql'
import type { Plugin } from 'graphql-yoga'
import { log } from '../src/logger.ts'

type OperationMetrics = { count: number; errors: number; totalMs: number }

// Latency and error rate per operation name – the labels a dashboard needs.
export const operationMetrics = new Map<string, OperationMetrics>()

export const useOperationLog = (
  write: (line: string) => void = (line) => log.info(line),
): Plugin => ({
  onExecute: ({ args }) => {
    const startedAt = performance.now()
    // args.operationName is only set when the client sends it – the document always knows the name.
    const document: DocumentNode = args.document
    const operationName = getOperationAST(document, args.operationName)?.name?.value ?? 'anonymous'
    return {
      onExecuteDone: ({ result }) => {
        const durationMs = Math.round(performance.now() - startedAt)
        const errorCount = 'errors' in result ? (result.errors?.length ?? 0) : 0
        const metrics = operationMetrics.get(operationName) ?? { count: 0, errors: 0, totalMs: 0 }
        operationMetrics.set(operationName, {
          count: metrics.count + 1,
          errors: metrics.errors + (errorCount > 0 ? 1 : 0),
          totalMs: metrics.totalMs + durationMs,
        })
        write(`[graphql] ${operationName} ${durationMs}ms errors=${errorCount}`)
      },
    }
  },
})
