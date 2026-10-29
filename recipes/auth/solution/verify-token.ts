import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { User } from '../src/data.ts'

// Checks signature (key from the JWKS endpoint, cached by jose), issuer, audience and expiry.
// Anything wrong – missing header, foreign key, expired, wrong audience – means: no user.
export const createVerifyToken = ({ issuer, audience }: { issuer: string; audience: string }) => {
  const jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`))
  return async (header: string | null): Promise<User | null> => {
    if (!header?.startsWith('Bearer ')) return null
    try {
      const { payload } = await jwtVerify(header.slice(7), jwks, { issuer, audience })
      const roles = Array.isArray(payload.roles) ? payload.roles.map(String) : []
      return { id: String(payload.sub), roles }
    } catch {
      return null
    }
  }
}
