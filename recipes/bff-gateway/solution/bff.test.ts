import assert from 'node:assert/strict'
import { test } from 'node:test'
import { findOrder } from '../src/domain/orders.ts'
import { createTestClient } from '../src/test-client.ts'
import { yoga as appBff } from './bff-app.ts'
import { yoga as webBff } from './bff-web.ts'
import { cancelOrder, cancelStaleOrders } from './domain/order-rules.ts'

const asCustomer = (server: Parameters<typeof createTestClient>[0], customerId: string) => {
  const client = createTestClient(server)
  return (query: string) => client(query, {}, { authorization: customerId })
}
const web = asCustomer(webBff, 'c-1')
const app = asCustomer(appBff, 'c-1')
const webAsOtherCustomer = asCustomer(webBff, 'c-2')

test('the domain rule works without GraphQL', () => {
  const system = { kind: 'system' } as const
  assert.deepEqual(cancelOrder('o-2', system), { ok: false, reason: 'NOT_CANCELLABLE' })
  assert.deepEqual(cancelOrder('o-404', system), { ok: false, reason: 'NOT_FOUND' })
  // a foreign order is reported as missing
  assert.deepEqual(cancelOrder('o-1', { kind: 'customer', customerId: 'c-2' }), {
    ok: false,
    reason: 'NOT_FOUND',
  })
})

test('two BFFs, two shapes, one domain', async () => {
  const page = await web(`query OrderPage { orderPage(id: "o-1") { customerName canCancel } }`)
  const tiles = await app(`query MyOrders { myOrders { id canCancel } }`)
  assert.deepEqual(page.data, { orderPage: { customerName: 'Ada Lovelace', canCancel: true } })
  assert.deepEqual(tiles.data, {
    myOrders: [
      { id: 'o-1', canCancel: true },
      { id: 'o-3', canCancel: true },
    ],
  })
})

test('both BFFs map the same domain result to the same error code', async () => {
  // o-2 belongs to c-2 and is already shipped
  const fromOwner = await webAsOtherCustomer(`mutation Cancel { cancelOrder(id: "o-2") { id } }`)
  const fromWeb = await web(`mutation Cancel { cancelOrder(id: "o-2") { id } }`)
  const fromApp = await app(`mutation Cancel { cancelOrder(id: "o-2") { id } }`)
  assert.equal(fromOwner.errors?.[0]?.extensions?.code, 'NOT_CANCELLABLE')
  assert.equal(fromWeb.errors?.[0]?.extensions?.code, 'NOT_FOUND')
  assert.equal(fromApp.errors?.[0]?.extensions?.code, 'NOT_FOUND')
})

test('the nightly job reuses the rule and cancels only stale open orders', () => {
  assert.deepEqual(cancelStaleOrders(new Date('2026-10-25T00:00:00Z'), 30), ['o-3'])
  assert.equal(findOrder('o-1')?.status, 'OPEN')
  assert.equal(findOrder('o-2')?.status, 'SHIPPED')
})
