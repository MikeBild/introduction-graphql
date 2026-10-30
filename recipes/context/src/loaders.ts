import DataLoader from 'dataloader'
import { db, type OrderRow, type ProductRow } from './db.ts'

export const createLoaders = () => ({
  // One key, one result: every field of a request shares the same order list.
  orders: new DataLoader(async (keys: readonly 'all'[]) => {
    const rows = await db.orders.findMany()
    return keys.map((): OrderRow[] => rows)
  }),
  product: new DataLoader(async (ids: readonly string[]) => {
    const rows = await db.products.findByIds(ids)
    const byId = new Map(rows.map((row) => [row.id, row]))
    // Same length and order as the keys; a missing row becomes null, never a gap.
    return ids.map((id): ProductRow | null => byId.get(id) ?? null)
  }),
})

export type Loaders = ReturnType<typeof createLoaders>
