import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { products, type Product } from './catalog.ts'
import type { StockRow } from './inventory-service.ts'

type Context = { inventoryUrl: string }

const typeDefs = /* GraphQL */ `
  type Product {
    id: ID!
    name: String!
    priceCents: Int!
    stock: Int!
  }

  type Query {
    products: [Product!]!
  }
`

// Starting point: one REST call per product, no timeout, no error mapping.
const fetchStock = async (inventoryUrl: string, productId: string): Promise<StockRow> => {
  const response = await fetch(`${inventoryUrl}/stock/${encodeURIComponent(productId)}`)
  if (!response.ok) throw new Error(`Upstream ${response.status}`)
  return (await response.json()) as StockRow
}

const resolvers = {
  Query: { products: () => products },
  Product: {
    stock: async (product: Product, _args: unknown, context: Context) =>
      (await fetchStock(context.inventoryUrl, product.id)).stock,
  },
}

export const createApp = async ({ inventoryUrl }: { inventoryUrl: string }) => {
  const server = new ApolloServer<Context>({ typeDefs, resolvers })
  await server.start()
  const app = express()
  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, { context: async (): Promise<Context> => ({ inventoryUrl }) }),
  )
  return app
}
