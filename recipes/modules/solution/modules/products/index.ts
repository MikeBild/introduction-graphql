import { readFileSync } from 'node:fs'

// The public surface of this module.
export const typeDefs = readFileSync(new URL('./schema.graphql', import.meta.url), 'utf8')
export { resolvers } from './resolvers.ts'
export { createProductLoader } from './loader.ts'
