import DataLoader from 'dataloader'
import { byKey } from '../../src/shipping/by-key.ts'
import type { ShippingClient } from './client.ts'

// Same signature as before: ids in, one row per id out, null where nothing was found.
// Only the body changed: the whole batch goes to the service in one request.
export const createLoaders = (shipping: ShippingClient) => ({
  shipmentByOrder: new DataLoader(async (orderIds: readonly string[]) =>
    byKey(await shipping.shipmentsByOrderIds(orderIds), (shipment) => shipment.orderId, orderIds),
  ),
  shippingAddress: new DataLoader(async (customerIds: readonly string[]) =>
    byKey(
      await shipping.addressesByCustomerIds(customerIds),
      (address) => address.customerId,
      customerIds,
    ),
  ),
})
