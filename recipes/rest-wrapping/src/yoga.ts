import { createSchema, createYoga, type YogaInitialContext } from 'graphql-yoga'
import { products, type Product } from './catalog.ts'
import type { StockRow } from './inventory-service.ts'
import { yogaLogger } from './logger.ts'

type Context = YogaInitialContext & { inventoryUrl: string }

const typeDefs = /* GraphQL */ `
  type Product {
    id: ID!
    title: String!
    available: Int!
  }

  type Query {
    products: [Product!]!
  }
`

// Starting point: one REST call per product, no timeout, no error mapping.
const fetchStock = async (inventoryUrl: string, sku: string): Promise<StockRow> => {
  const response = await fetch(`${inventoryUrl}/stock/${encodeURIComponent(sku)}`)
  if (!response.ok) throw new Error(`Upstream ${response.status}`)
  return (await response.json()) as StockRow
}

export const createGateway = ({ inventoryUrl }: { inventoryUrl: string }) =>
  createYoga({
    logging: yogaLogger,
    context: { inventoryUrl },
    schema: createSchema<Context>({
      typeDefs,
      resolvers: {
        Query: { products: () => products },
        Product: {
          available: async (product: Product, _args: unknown, context: Context) =>
            (await fetchStock(context.inventoryUrl, product.sku)).available,
        },
      },
    }),
  })
