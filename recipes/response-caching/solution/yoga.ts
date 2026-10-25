import { useResponseCache } from '@graphql-yoga/plugin-response-cache'
import { createYoga } from 'graphql-yoga'
import { yogaLogger } from '../src/logger.ts'
import { schema } from '../src/schema.ts'

export const yoga = createYoga({
  logging: yogaLogger,
  schema,
  plugins: [
    useResponseCache({
      // Separates users: without a session, private answers would be shared.
      session: (request) => request.headers.get('authorization') ?? null,
      ttl: 10_000,
      // ttlPerType still works but is deprecated – type names are valid schema coordinates here.
      ttlPerSchemaCoordinate: { Product: 60_000 },
      includeExtensionMetadata: true,
    }),
  ],
})
