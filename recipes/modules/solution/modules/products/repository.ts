import { db } from '../../../src/db.ts'

export const findProducts = () => db.products.findMany()
export const findProductsByIds = (ids: readonly string[]) => db.products.findByIds(ids)
