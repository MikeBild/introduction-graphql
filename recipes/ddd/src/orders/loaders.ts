import DataLoader from 'dataloader'
import { findBillingContactsByIds, findOrdersByIds } from './repository.ts'

export const createLoaders = () => ({
  order: new DataLoader(async (ids: readonly string[]) => findOrdersByIds(ids)),
  billingContact: new DataLoader(async (ids: readonly string[]) => findBillingContactsByIds(ids)),
})
