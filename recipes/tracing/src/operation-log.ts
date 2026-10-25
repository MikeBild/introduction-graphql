import type { Plugin } from 'graphql-yoga'
import { log } from './logger.ts'

// Logs duration and error count per operation name – not per HTTP path.
export const useOperationLog = (
  write: (line: string) => void = (line) => log.info(line),
): Plugin => ({
  onExecute: ({ args }) => {
    const startedAt = performance.now()
    return {
      onExecuteDone: ({ result }) => {
        const errorCount = 'errors' in result ? (result.errors?.length ?? 0) : 0
        write(
          `[graphql] ${args.operationName ?? 'anonymous'} ${Math.round(performance.now() - startedAt)}ms errors=${errorCount}`,
        )
      },
    }
  },
})
