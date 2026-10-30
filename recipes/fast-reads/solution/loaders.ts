import DataLoader from 'dataloader'
import type { OrderItemRow, ProductRow } from '../src/db.ts'
import type { FastDb } from './db.ts'

export const createLoaders = (db: FastDb) => ({
  // A batch of N keys becomes one IN query, in the order of the keys.
  itemsOfOrder: new DataLoader(async (orderIds: readonly string[]) => {
    const rows = await db.items.ofOrders(orderIds)
    const byOrder = Map.groupBy(rows, ({ order_id }) => order_id)
    return orderIds.map((id): OrderItemRow[] => byOrder.get(id) ?? [])
  }),
  product: new DataLoader(async (ids: readonly string[]) => {
    const rows = await db.products.findByIds(ids)
    const byId = new Map(rows.map((row) => [row.id, row]))
    // Same length and order as the keys; a missing row becomes null, never a gap.
    return ids.map((id): ProductRow | null => byId.get(id) ?? null)
  }),
})

export type Loaders = ReturnType<typeof createLoaders>
