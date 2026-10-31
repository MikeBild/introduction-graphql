// One client module per service. These types are the published part of the shipping contract:
// the graph has its own copy of them and never imports from the service.
export type Shipment = Readonly<{ id: string; orderId: string; trackingNumber: string }>
export type CustomerAddress = Readonly<{
  customerId: string
  recipient: string
  street: string
  city: string
}>

export const createShippingClient = (baseUrl: string, timeoutMs = 1000) => {
  const get = async <T>(path: string): Promise<T> => {
    const response = await fetch(`${baseUrl}${path}`, { signal: AbortSignal.timeout(timeoutMs) })
    if (!response.ok) throw new Error(`shipping answered ${response.status}`)
    return (await response.json()) as T
  }
  const list = (name: string, ids: readonly string[]) =>
    new URLSearchParams({ [name]: ids.join(',') })

  return {
    shipments: () => get<Shipment[]>('/shipments'),
    shipmentsByOrderIds: (orderIds: readonly string[]) =>
      get<Shipment[]>(`/shipments?${list('orderIds', orderIds)}`),
    addressesByCustomerIds: (customerIds: readonly string[]) =>
      get<CustomerAddress[]>(`/addresses?${list('customerIds', customerIds)}`),
  }
}

export type ShippingClient = ReturnType<typeof createShippingClient>
