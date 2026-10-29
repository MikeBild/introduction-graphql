import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import {
  BasicTracerProvider,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  type SpanExporter,
} from '@opentelemetry/sdk-trace-base'
import express from 'express'
import { resolvers, typeDefs } from '../src/schema.ts'
import { operationLogPlugin } from './operation-log.ts'
import { requireOperationNamePlugin } from './require-operation-name.ts'
import { ownResolvers, tracingPlugin } from './tracing.ts'

type AppOptions = { write?: (line: string) => void; spanExporter?: SpanExporter }

export const createApp = async ({
  write,
  spanExporter = new ConsoleSpanExporter(),
}: AppOptions = {}) => {
  const tracerProvider = new BasicTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(spanExporter)],
  })
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
      requireOperationNamePlugin(),
      operationLogPlugin(write),
      tracingPlugin(tracerProvider.getTracer('shop-graphql'), ownResolvers(resolvers)),
    ],
  })
  await server.start()
  const app = express()
  app.use('/graphql', express.json(), expressMiddleware(server))
  return app
}
