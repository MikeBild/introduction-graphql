import { createYoga } from 'graphql-yoga'
import { yogaLogger } from './logger.ts'
import { useOperationLog } from './operation-log.ts'
import { schema } from './schema.ts'

export const createServer = (write?: (line: string) => void) =>
  createYoga({ logging: yogaLogger, schema, plugins: [useOperationLog(write)] })

export const yoga = createServer()
