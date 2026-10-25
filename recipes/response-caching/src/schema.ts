import { createSchema, type YogaInitialContext } from 'graphql-yoga'
import { log } from './logger.ts'

type Product = { id: string; title: string; price: number }

const products: Product[] = [
  { id: 'p-1', title: 'Keyboard', price: 89 },
  { id: 'p-2', title: 'Mouse', price: 39 },
]
const cartsByUser = new Map([
  ['user-ada', ['p-1']],
  ['user-alan', ['p-2']],
])

// Counts reads from the "database" – the number the cache should bring down.
export const database = { reads: 0 }
const read = <T>(label: string, value: T): T => {
  database.reads += 1
  log.debug(`[db] read ${label}`)
  return value
}

export const schema = createSchema<YogaInitialContext>({
  typeDefs: /* GraphQL */ `
    type Product {
      id: ID!
      title: String!
      price: Float!
    }

    type Viewer {
      id: ID!
      cart: [Product!]!
    }

    type Query {
      products: [Product!]!
      me: Viewer
    }

    type Mutation {
      updatePrice(id: ID!, price: Float!): Product
    }
  `,
  resolvers: {
    Query: {
      products: () => read('products', products),
      me: (_parent: unknown, _args: unknown, { request }: YogaInitialContext) => {
        const userId = request.headers.get('authorization')
        return userId ? { id: userId } : null
      },
    },
    Viewer: {
      cart: ({ id }: { id: string }) =>
        read(
          `cart ${id}`,
          products.filter((product) => cartsByUser.get(id)?.includes(product.id)),
        ),
    },
    Mutation: {
      updatePrice: (_parent: unknown, { id, price }: { id: string; price: number }) => {
        const product = products.find((candidate) => candidate.id === id)
        if (product) product.price = price
        return product ?? null
      },
    },
  },
})
