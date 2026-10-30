import DataLoader from 'dataloader'
import { findAddressesByCustomerIds, findShipmentsByOrderIds } from './repository.ts'

export const createLoaders = () => ({
  shipmentByOrder: new DataLoader(async (orderIds: readonly string[]) =>
    findShipmentsByOrderIds(orderIds),
  ),
  shippingAddress: new DataLoader(async (customerIds: readonly string[]) =>
    findAddressesByCustomerIds(customerIds),
  ),
})
