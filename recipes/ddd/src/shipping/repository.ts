export type Address = Readonly<{ recipient: string; street: string; city: string }>
export type Shipment = Readonly<{ id: string; orderId: string; trackingNumber: string }>

const addresses = new Map<string, Address>([
  ['c-1', { recipient: 'Ada Lovelace', street: 'Werkstattweg 1', city: 'Leipzig' }],
  ['c-2', { recipient: 'Hopper GmbH, Wareneingang', street: 'Hafenstraße 7', city: 'Bremen' }],
])

const shipments: readonly Shipment[] = [{ id: 's-1', orderId: 'o-4', trackingNumber: 'DE-1001' }]

export const findShipments = () => shipments

export const findShipmentsByOrderIds = (orderIds: readonly string[]) =>
  orderIds.map((orderId) => shipments.find((shipment) => shipment.orderId === orderId) ?? null)

export const findAddressesByCustomerIds = (customerIds: readonly string[]) =>
  customerIds.map((customerId) => addresses.get(customerId) ?? null)
