import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import express from 'express'
import { exportJWK, generateKeyPair, SignJWT } from 'jose'

// A tiny stand-in for the identity provider (Keycloak, Auth0, Entra ID, …) – for tests and
// local development only. It publishes its public key as JWKS and signs access tokens.
// In production the browser gets the token via Authorization Code Flow with PKCE.
export const startDevIssuer = async (port = 0) => {
  const { publicKey, privateKey } = await generateKeyPair('RS256')
  const jwk = { ...(await exportJWK(publicKey)), kid: 'dev-key-1', alg: 'RS256', use: 'sig' }

  const app = express()
  app.get('/.well-known/jwks.json', (_req, res) => {
    res.json({ keys: [jwk] })
  })
  const server = createServer(app)
  await new Promise<void>((resolve) => server.listen(port, resolve))
  const issuer = `http://localhost:${(server.address() as AddressInfo).port}`

  const sign = (
    claims: { sub: string; roles: string[] },
    options: { audience?: string; expiresIn?: string; issuer?: string } = {},
  ) =>
    new SignJWT({ roles: claims.roles })
      .setProtectedHeader({ alg: 'RS256', kid: 'dev-key-1' })
      .setSubject(claims.sub)
      .setIssuer(options.issuer ?? issuer)
      .setAudience(options.audience ?? 'shop-api')
      .setIssuedAt()
      .setExpirationTime(options.expiresIn ?? '15m')
      .sign(privateKey)

  return {
    issuer,
    sign,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  }
}
