import { afterAll, describe, expect, it } from 'vitest'
import { startTestServer } from '../src/test-client.ts'
import { createApp } from './app.ts'

// Real HTTP requests against the Express app on a free port.
const { execute, close } = await startTestServer(await createApp())
afterAll(close)
// Untyped JSON on purpose: the tests read it like a client would.
const post = (query: string, variables = {}, headers: Record<string, string> = {}) =>
  execute<any>(query, variables, headers) as Promise<any>
const asAda = { authorization: 'Bearer token-ada' }
const placeOrder = `mutation Place($input: PlaceOrderInput!) {
  placeOrder(input: $input) { order { id status totalCents items { product { name } quantity priceCents } } }
}`
const cancelOrder = `mutation Cancel($input: CancelOrderInput!) {
  cancelOrder(input: $input) { order { id status } }
}`

describe('queries', () => {
  it('answers products with prices in cents', async () => {
    const result = await post(`query Products { products { id name priceCents stock } }`)
    expect(result.errors).toBeUndefined()
    expect(result.data.products[0]).toEqual({
      id: 'p-1',
      name: 'Hammer',
      priceCents: 1290,
      stock: 10,
    })
  })

  it('answers customer(id) with the orders of that customer, newest first', async () => {
    const result = await post(`query { customer(id: "c-1") { name orders { id status } } }`)
    expect(result.data.customer).toEqual({
      name: 'Ada Lovelace',
      orders: [
        { id: 'o-3', status: 'DRAFT' },
        { id: 'o-1', status: 'PLACED' },
      ],
    })
  })

  it('goes from an order to its customer and from an item to its product', async () => {
    const result = await post(
      `query { order(id: "o-2") { customer { name } items { product { name } quantity } } }`,
    )
    expect(result.data.order).toEqual({
      customer: { name: 'Grace Hopper' },
      items: [{ product: { name: 'Screwdriver set' }, quantity: 1 }],
    })
  })
})

describe('mutations', () => {
  it('placeOrder without a token answers UNAUTHENTICATED – status 200, data null', async () => {
    const result = await post(placeOrder, { input: { items: [{ productId: 'p-1', quantity: 1 }] } })
    expect(result.status).toBe(200)
    expect(result.data).toBeNull()
    expect(result.errors[0].extensions.code).toBe('UNAUTHENTICATED')
  })

  it('placeOrder takes prices from the catalog and sums up in cents', async () => {
    const result = await post(
      placeOrder,
      {
        input: {
          items: [
            { productId: 'p-1', quantity: 2 },
            { productId: 'p-2', quantity: 1 },
          ],
        },
      },
      asAda,
    )
    expect(result.data.placeOrder.order).toMatchObject({
      status: 'PLACED',
      totalCents: 2 * 1290 + 2490,
      items: [
        { product: { name: 'Hammer' }, quantity: 2, priceCents: 1290 },
        { product: { name: 'Screwdriver set' }, quantity: 1, priceCents: 2490 },
      ],
    })
  })

  it('placeOrder rejects too little stock with OUT_OF_STOCK', async () => {
    const result = await post(
      placeOrder,
      { input: { items: [{ productId: 'p-3', quantity: 1 }] } },
      asAda,
    )
    expect(result.errors[0].extensions.code).toBe('OUT_OF_STOCK')
  })

  it('cancelOrder cancels a PLACED order of the caller', async () => {
    const result = await post(cancelOrder, { input: { orderId: 'o-1' } }, asAda)
    expect(result.data.cancelOrder.order).toEqual({ id: 'o-1', status: 'CANCELLED' })
  })

  it('cancelOrder refuses foreign orders and orders that are already paid', async () => {
    const foreign = await post(cancelOrder, { input: { orderId: 'o-2' } }, asAda)
    expect(foreign.errors[0].extensions.code).toBe('FORBIDDEN')
    const paid = await post(
      cancelOrder,
      { input: { orderId: 'o-2' } },
      {
        authorization: 'Bearer token-grace',
      },
    )
    expect(paid.errors[0].extensions.code).toBe('NOT_CANCELLABLE')
  })

  it('rejects variables without the required items before any resolver runs: status 400', async () => {
    const result = await post(placeOrder, { input: {} }, asAda)
    expect(result.status).toBe(400)
    expect(result.errors[0].message).toMatch(/Field "items" of required type/)
  })
})
