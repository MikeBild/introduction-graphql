import type { Context } from '../context.ts'
import type { Shipment } from './client.ts'

// Unchanged for the fields: only ids cross the boundary, the loaders do the rest.
// Query.shipments asks the service through the client in the context.
export const resolvers = {
  Query: {
    shipments: (_parent: unknown, _args: unknown, { shipping }: Context) => shipping.shipments(),
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
