import DataLoader from 'dataloader'
// This import crosses the boundary: the graph reads the data of the shipping context in-process.
import {
  findAddressesByCustomerIds,
  findShipmentsByOrderIds,
} from '../shipping-service/repository.ts'
import { byKey } from './by-key.ts'

export const createLoaders = () => ({
  shipmentByOrder: new DataLoader(async (orderIds: readonly string[]) =>
    byKey(findShipmentsByOrderIds(orderIds), (shipment) => shipment.orderId, orderIds),
  ),
  shippingAddress: new DataLoader(async (customerIds: readonly string[]) =>
    byKey(findAddressesByCustomerIds(customerIds), (address) => address.customerId, customerIds),
  ),
})
