import { createSchema, createYoga, type YogaInitialContext } from 'graphql-yoga'
import { products, type Product } from '../src/catalog.ts'
import { yogaLogger } from '../src/logger.ts'
import { createStockLoader } from './inventory-client.ts'

type Context = YogaInitialContext & { stockLoader: ReturnType<typeof createStockLoader> }

const typeDefs = /* GraphQL */ `
  type Product {
    id: ID!
    title: String!
    "null when the inventory service is slow or down"
    available: Int
  }

  type Query {
    products: [Product!]!
  }
`

export const createGateway = ({ inventoryUrl }: { inventoryUrl: string }) =>
  createYoga({
    logging: yogaLogger,
    context: ({ request }) => ({
      stockLoader: createStockLoader(inventoryUrl, request.headers.get('authorization')),
    }),
    schema: createSchema<Context>({
      typeDefs,
      resolvers: {
        Query: { products: () => products },
        Product: {
          available: (product: Product, _args: unknown, context: Context) =>
            context.stockLoader.load(product.sku),
        },
      },
    }),
  })
