import type { Request } from 'express'
import { db, type UserRow } from './db.ts'
import { createLoaders, type Loaders } from './loaders.ts'

// Identity and permissions of whoever asks, or null without a sign-in.
export type Viewer = Readonly<UserRow>

export type Context = Readonly<{
  viewer: Viewer | null
  loaders: Loaders
}>

// A plain header keeps this recipe short. Real tokens are the topic of recipes/auth.
export const createContext = async ({ req }: { req: Request }): Promise<Context> => {
  const viewerId = req.get('x-viewer-id')
  return Object.freeze({
    viewer: viewerId ? await db.users.findById(viewerId) : null,
    loaders: createLoaders(),
  })
}
