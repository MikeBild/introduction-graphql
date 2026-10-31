import { readFileSync } from 'node:fs'

// The schema did not change: the module reads the same file as before.
export const typeDefs = readFileSync(
  new URL('../../src/shipping/schema.graphql', import.meta.url),
  'utf8',
)
export { resolvers } from './resolvers.ts'
export { createLoaders } from './loaders.ts'
