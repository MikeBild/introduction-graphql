import { randomUUID } from 'node:crypto'
import type { Request } from 'express'
import { createLoaders, type Loaders } from '../src/loaders.ts'

// The contract between the transport and every resolver. Read-only: nothing writes to it later.
export type Context = Readonly<{
  requestId: string
  loaders: Loaders
}>

export const createContext = async ({ req }: { req: Request }): Promise<Context> =>
  Object.freeze({
    requestId: req.get('x-request-id') ?? randomUUID(),
    loaders: createLoaders(),
  })
