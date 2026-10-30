import type { DatabaseSync } from 'node:sqlite'

// @types/node 26.6 only knows the deprecated name DatabaseSync (DEP0210).
// Delete this file as soon as @types/node declares Database.
declare module 'node:sqlite' {
  export const Database: typeof DatabaseSync
  export type Database = DatabaseSync
}
