import type { Request } from 'express'
import { createProductLoader } from './modules/products/index.ts'
import type { Viewer } from './viewer.ts'

export type Context = Readonly<{
  viewer: Viewer | null
  loaders: Readonly<{ product: ReturnType<typeof createProductLoader> }>
}>

export const createLoaders = (): Context['loaders'] => ({ product: createProductLoader() })

// A plain header keeps this recipe short. Real tokens are the topic of recipes/auth.
export const createContext = async ({ req }: { req: Request }): Promise<Context> => {
  const customerId = req.get('x-customer-id')
  return Object.freeze({
    viewer: customerId ? { id: customerId } : null,
    loaders: createLoaders(),
  })
}
