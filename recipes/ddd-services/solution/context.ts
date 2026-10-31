import * as orders from '../src/orders/index.ts'
import { createShippingClient, type ShippingClient } from './shipping/client.ts'
import * as shipping from './shipping/index.ts'

export type Config = Readonly<{ shippingUrl: string }>

export const createLoaders = (client: ShippingClient) => ({
  ...orders.createLoaders(),
  ...shipping.createLoaders(client),
})

export type Loaders = ReturnType<typeof createLoaders>
export type Context = Readonly<{ loaders: Loaders; shipping: ShippingClient }>

// The client is created once per app, the loaders once per request.
export const createContext = ({ shippingUrl }: Config) => {
  const client = createShippingClient(shippingUrl)
  return async (): Promise<Context> =>
    Object.freeze({ loaders: createLoaders(client), shipping: client })
}
