import * as orders from './modules/orders/index.ts'
import * as products from './modules/products/index.ts'
import { mergeResolvers } from './merge-resolvers.ts'

const modules = [orders, products]

// The root types stay empty, every module extends them.
const rootTypeDefs = /* GraphQL */ `
  type Query
  type Mutation
`

export const typeDefs = [rootTypeDefs, ...modules.map((module) => module.typeDefs)]
export const resolvers = mergeResolvers(...modules.map((module) => module.resolvers))
