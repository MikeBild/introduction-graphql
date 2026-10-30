import { readFileSync } from 'node:fs'
import { mergeResolvers } from './merge-resolvers.ts'
import * as orders from './orders/index.ts'

const modules = [orders]

const rootTypeDefs = readFileSync(new URL('./schema.graphql', import.meta.url), 'utf8')

export const typeDefs = [rootTypeDefs, ...modules.map((module) => module.typeDefs)]
export const resolvers = mergeResolvers(...modules.map((module) => module.resolvers))
