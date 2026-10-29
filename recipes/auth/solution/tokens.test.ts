import { gql, type TypedDocumentNode } from '@apollo/client'
import { afterAll, describe, expect, it } from 'vitest'
import { startDevIssuer } from '../src/dev-issuer.ts'
import { startTestServer } from '../src/test-client.ts'
import { createApp } from './app.ts'
import { createShopClient } from './client.ts'
import { createVerifyToken } from './verify-token.ts'

const idp = await startDevIssuer()
const { url, execute, close } = await startTestServer(
  await createApp({
    verifyToken: createVerifyToken({ issuer: idp.issuer, audience: 'shop-api' }),
  }),
)
afterAll(async () => {
  await close()
  await idp.close()
})

const bearer = (token: string) => ({ authorization: `Bearer ${token}` })
const ordersWithEmail = `query { orders { id customer { email } } }`
type OrdersData = { orders: { id: string; customer: { email: string | null } }[] }

describe('access tokens verified with jose', () => {
  it('a valid token for c-1 shows only the orders of c-1', async () => {
    const token = await idp.sign({ sub: 'c-1', roles: ['CUSTOMER'] })
    const result = await execute<OrdersData>(ordersWithEmail, {}, bearer(token))
    expect(result.data?.orders.map((order) => order.id)).toEqual(['o-1', 'o-3'])
    expect(result.data?.orders[0]?.customer.email).toBeNull()
  })

  it('the SUPPORT role comes from the roles claim', async () => {
    const token = await idp.sign({ sub: 'u-1', roles: ['SUPPORT'] })
    const result = await execute<OrdersData>(ordersWithEmail, {}, bearer(token))
    expect(result.data?.orders).toHaveLength(3)
    expect(result.data?.orders[0]?.customer.email).toBe('ada@example.com')
  })

  it.each([
    ['for another audience', { audience: 'billing-api' }],
    ['from another issuer', { issuer: 'https://evil.example.com' }],
    ['that has expired', { expiresIn: '-1m' }],
  ])('rejects a token %s as UNAUTHENTICATED', async (_case, options) => {
    const token = await idp.sign({ sub: 'c-1', roles: ['CUSTOMER'] }, options)
    const result = await execute(ordersWithEmail, {}, bearer(token))
    expect(result.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
  })

  it('rejects a token signed with a key that is not in the JWKS', async () => {
    const stranger = await startDevIssuer()
    const token = await stranger.sign({ sub: 'c-1', roles: ['SUPPORT'] }, { issuer: idp.issuer })
    await stranger.close()
    const result = await execute(ordersWithEmail, {}, bearer(token))
    expect(result.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
  })
})

describe('Apollo Client', () => {
  it('sends the access token via SetContextLink', async () => {
    const client = createShopClient(url, () => idp.sign({ sub: 'c-2', roles: ['CUSTOMER'] }))
    const query: TypedDocumentNode<{ orders: { id: string }[] }> = gql`
      query MyOrders {
        orders {
          id
        }
      }
    `
    const { data } = await client.query({ query })
    expect(data?.orders.map((order) => order.id)).toEqual(['o-2'])
  })
})
