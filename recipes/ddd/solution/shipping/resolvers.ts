import { findShipments, type Shipment } from '../../src/shipping/repository.ts'
import type { Context } from '../context.ts'

// Only ids cross the boundary: this module never sees what an order or a customer contains.
export const resolvers = {
  Query: {
    shipments: () => findShipments(),
  },
  Shipment: {
    order: (shipment: Shipment, _args: unknown, { loaders }: Context) =>
      loaders.order.load(shipment.orderId),
  },
  Order: {
    shipment: (order: { id: string }, _args: unknown, { loaders }: Context) =>
      loaders.shipmentByOrder.load(order.id),
  },
  Customer: {
    shippingAddress: (customer: { id: string }, _args: unknown, { loaders }: Context) =>
      loaders.shippingAddress.load(customer.id),
  },
}
