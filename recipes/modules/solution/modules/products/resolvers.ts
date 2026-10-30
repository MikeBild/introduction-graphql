import type { ProductRow } from '../../../src/db.ts'
import { isInStock, listProducts } from './logic.ts'

export const resolvers = {
  Query: {
    products: () => listProducts(),
  },
  Product: {
    inStock: (product: ProductRow) => isInStock(product),
  },
}
