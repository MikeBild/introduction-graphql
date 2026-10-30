// This import crosses the boundary between two bounded contexts.
import { findOrdersByIds } from '../orders/repository.ts'
import { findShipments, type Shipment } from './repository.ts'

export const resolvers = {
  Query: {
    shipments: () => findShipments(),
  },
  Shipment: {
    order: (shipment: Shipment) => findOrdersByIds([shipment.orderId])[0],
  },
}
