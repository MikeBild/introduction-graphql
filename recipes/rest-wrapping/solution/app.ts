import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { products, type Product } from '../src/catalog.ts'
import { createStockLoader } from './inventory-client.ts'

type Context = { stockLoader: ReturnType<typeof createStockLoader> }

const typeDefs = /* GraphQL */ `
  type Product {
    id: ID!
    name: String!
    priceCents: Int!
    "null when the inventory service is slow or down"
    stock: Int
  }

  type Query {
    products: [Product!]!
  }
`

const resolvers = {
  Query: { products: () => products },
  Product: {
    stock: (product: Product, _args: unknown, context: Context) =>
      context.stockLoader.load(product.id),
  },
}

export const createApp = async ({ inventoryUrl }: { inventoryUrl: string }) => {
  const server = new ApolloServer<Context>({ typeDefs, resolvers })
  await server.start()
  const app = express()
  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<Context> => ({
        stockLoader: createStockLoader(inventoryUrl, req.headers.authorization ?? null),
      }),
    }),
  )
  return app
}
