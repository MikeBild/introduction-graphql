import { readFileSync } from 'node:fs'

// The public face of the module: other code gets the schema, the resolvers and the loaders.
export const typeDefs = readFileSync(new URL('./schema.graphql', import.meta.url), 'utf8')
export { resolvers } from './resolvers.ts'
export { createLoaders } from './loaders.ts'
