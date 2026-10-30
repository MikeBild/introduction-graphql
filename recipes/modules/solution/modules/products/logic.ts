import type { ProductRow } from '../../../src/db.ts'
import { findProducts } from './repository.ts'

export const listProducts = () => findProducts()
export const isInStock = (product: ProductRow) => product.stock > 0
