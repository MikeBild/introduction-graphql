import DataLoader from 'dataloader'
import { db, type CustomerRow } from '../src/db.ts'

// One set of loaders per request: the cache must never be shared between users.
export const createLoaders = () => ({
  customer: new DataLoader(async (ids: readonly string[]) => {
    const rows = await db.customers.findByIds(ids)
    const byId = new Map(rows.map((row) => [row.id, row]))
    // Same length and order as the keys; a missing row becomes null, never a gap.
    return ids.map((id): CustomerRow | null => byId.get(id) ?? null)
  }),
})

export type Loaders = ReturnType<typeof createLoaders>
