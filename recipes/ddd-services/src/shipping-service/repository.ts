// The data of the shipping context. Today the graph reads it in-process; after the exercise only the service does.
export type Address = Readonly<{ recipient: string; street: string; city: string }>
export type CustomerAddress = Readonly<{ customerId: string } & Address>
export type Shipment = Readonly<{ id: string; orderId: string; trackingNumber: string }>

const addresses: readonly CustomerAddress[] = [
  { customerId: 'c-1', recipient: 'Ada Lovelace', street: 'Werkstattweg 1', city: 'Leipzig' },
  {
    customerId: 'c-2',
    recipient: 'Hopper GmbH, Wareneingang',
    street: 'Hafenstraße 7',
    city: 'Bremen',
  },
]

const shipments: readonly Shipment[] = [{ id: 's-1', orderId: 'o-4', trackingNumber: 'DE-1001' }]

export const findShipments = () => shipments

// Batch readers: they answer with the rows they find, the loader maps them back to its keys.
export const findShipmentsByOrderIds = (orderIds: readonly string[]) =>
  shipments.filter((shipment) => orderIds.includes(shipment.orderId))

export const findAddressesByCustomerIds = (customerIds: readonly string[]) =>
  addresses.filter((address) => customerIds.includes(address.customerId))
