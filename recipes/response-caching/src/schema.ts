import { log } from './logger.ts'

export type Context = { userId: string | null }
type Product = { id: string; name: string; priceCents: number; stock: number }

const products: Product[] = [
  { id: 'p-1', name: 'Hammer', priceCents: 1990, stock: 12 },
  { id: 'p-2', name: 'Screwdriver set', priceCents: 2490, stock: 0 },
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

export const typeDefs = /* GraphQL */ `
  type Product {
    id: ID!
    name: String!
    priceCents: Int!
    stock: Int!
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
    updatePrice(id: ID!, priceCents: Int!): Product
  }
`

export const createResolvers = ({ onProductChanged = () => {} } = {}) => ({
  Query: {
    products: () => read('products', products),
    me: (_parent: unknown, _args: unknown, { userId }: Context) => (userId ? { id: userId } : null),
  },
  Viewer: {
    cart: ({ id }: { id: string }) =>
      read(
        `cart ${id}`,
        products.filter((product) => cartsByUser.get(id)?.includes(product.id)),
      ),
  },
  Mutation: {
    updatePrice: (_parent: unknown, { id, priceCents }: { id: string; priceCents: number }) => {
      const product = products.find((candidate) => candidate.id === id)
      if (!product) return null
      product.priceCents = priceCents
      onProductChanged()
      return product
    },
  },
})
