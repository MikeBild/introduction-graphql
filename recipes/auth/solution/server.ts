import { log } from '../src/logger.ts'
import { startDevIssuer } from '../src/dev-issuer.ts'
import { createApp } from './app.ts'
import { createVerifyToken } from './verify-token.ts'

const port = Number(process.env.PORT ?? 4000)
// Local stand-in for the identity provider on the next port; prints tokens to try in Sandbox.
const idp = await startDevIssuer(port + 1)
const app = await createApp({
  verifyToken: createVerifyToken({ issuer: idp.issuer, audience: 'shop-api' }),
})

app.listen(port, async () => {
  log.info(`[server] Apollo Server ready at http://localhost:${port}/graphql (Apollo Sandbox)`)
  log.info(`[idp] JWKS at ${idp.issuer}/.well-known/jwks.json`)
  log.info(`[idp] Bearer for c-1:     ${await idp.sign({ sub: 'c-1', roles: ['CUSTOMER'] })}`)
  log.info(`[idp] Bearer for support: ${await idp.sign({ sub: 'u-1', roles: ['SUPPORT'] })}`)
})
