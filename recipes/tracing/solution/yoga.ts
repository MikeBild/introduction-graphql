import { useOpenTelemetry } from '@envelop/opentelemetry'
import {
  BasicTracerProvider,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  type SpanExporter,
} from '@opentelemetry/sdk-trace-base'
import { createYoga } from 'graphql-yoga'
import { yogaLogger } from '../src/logger.ts'
import { schema } from '../src/schema.ts'
import { useOperationLog } from './operation-log.ts'
import { useRequireOperationName } from './require-operation-name.ts'

type ServerOptions = { write?: (line: string) => void; spanExporter?: SpanExporter }

export const createServer = ({
  write,
  spanExporter = new ConsoleSpanExporter(),
}: ServerOptions = {}) => {
  const tracerProvider = new BasicTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(spanExporter)],
  })
  return createYoga({
    logging: yogaLogger,
    schema,
    plugins: [
      useRequireOperationName(),
      useOperationLog(write),
      // Spans for the operation and for resolvers with own logic; no variables, no results (personal data).
      useOpenTelemetry(
        { resolvers: true, defaultResolvers: false, variables: false, result: false },
        tracerProvider,
      ),
    ],
  })
}

export const yoga = createServer()
