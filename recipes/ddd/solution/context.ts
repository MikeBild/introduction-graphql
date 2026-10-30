import * as orders from './orders/index.ts'
import * as shipping from './shipping/index.ts'

export const createLoaders = () => ({ ...orders.createLoaders(), ...shipping.createLoaders() })

export type Loaders = ReturnType<typeof createLoaders>
export type Context = Readonly<{ loaders: Loaders }>

export const createContext = async (): Promise<Context> =>
  Object.freeze({ loaders: createLoaders() })
