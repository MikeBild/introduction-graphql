import DataLoader from 'dataloader'
import type { ProductRow } from '../../../src/db.ts'
import { findProductsByIds } from './repository.ts'

export const createProductLoader = () =>
  new DataLoader(async (ids: readonly string[]) => {
    const rows = await findProductsByIds(ids)
    const byId = new Map(rows.map((row) => [row.id, row]))
    // Same length and order as the keys; a missing row becomes null, never a gap.
    return ids.map((id): ProductRow | null => byId.get(id) ?? null)
  })
