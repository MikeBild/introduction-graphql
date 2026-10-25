import { maxAliasesPlugin } from '@escape.tech/graphql-armor-max-aliases'
import { maxDepthPlugin } from '@escape.tech/graphql-armor-max-depth'
import { usePersistedOperations } from '@graphql-yoga/plugin-persisted-operations'
import { createYoga } from 'graphql-yoga'
import manifest from '../persisted-documents.json' with { type: 'json' }
import { yogaLogger } from '../src/logger.ts'
import { schema } from '../src/schema.ts'
import { useCostLimit } from './cost-limit.ts'

const persistedOperations = new Map(Object.entries(manifest))
const PARTNER_KEY = process.env.PARTNER_KEY ?? 'partner-secret'

export const yoga = createYoga({
  logging: yogaLogger,
  schema,
  plugins: [
    // Own clients send only a hash; partners with a key may send their own queries.
    usePersistedOperations({
      getPersistedOperation: (hash) => persistedOperations.get(hash) ?? null,
      allowArbitraryOperations: (request) => request.headers.get('x-partner-key') === PARTNER_KEY,
    }),
    // Limits stay active for everything that runs.
    maxDepthPlugin({ n: 5 }),
    maxAliasesPlugin({ n: 5 }),
    useCostLimit({ maxCost: 2_000 }),
  ],
})
