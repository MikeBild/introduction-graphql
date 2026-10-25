import assert from 'node:assert/strict'
import { test } from 'node:test'
import { findOrder } from '../src/domain/orders.ts'
import { createTestClient } from '../src/test-client.ts'
import { yoga as appBff } from './bff-app.ts'
import { yoga as webBff } from './bff-web.ts'
import { cancelOrder, cancelStaleOrders } from './domain/order-rules.ts'

const web = createTestClient(webBff)
const app = createTestClient(appBff)

test('the domain rule works without GraphQL', () => {
  assert.deepEqual(cancelOrder('o-2'), { ok: false, reason: 'NOT_CANCELLABLE' })
  assert.deepEqual(cancelOrder('o-404'), { ok: false, reason: 'NOT_FOUND' })
})

test('two BFFs, two shapes, one domain', async () => {
  const page = await web(`query OrderPage { orderPage(id: "o-1") { customerName canCancel } }`)
  const tiles = await app(
    `query MyOrders { myOrders { id canCancel } }`,
    {},
    { authorization: 'c-1' },
  )
  assert.deepEqual(page.data, { orderPage: { customerName: 'Ada Lovelace', canCancel: true } })
  assert.deepEqual(tiles.data, {
    myOrders: [
      { id: 'o-1', canCancel: true },
      { id: 'o-3', canCancel: true },
    ],
  })
})

test('both BFFs map the same domain result to the same error code', async () => {
  const fromWeb = await web(`mutation Cancel { cancelOrder(id: "o-2") { id } }`)
  const fromApp = await app(`mutation Cancel { cancelOrder(id: "o-2") { id } }`)
  assert.equal(fromWeb.errors?.[0]?.extensions?.code, 'NOT_CANCELLABLE')
  assert.equal(fromApp.errors?.[0]?.extensions?.code, 'NOT_CANCELLABLE')
})

test('the nightly job reuses the rule and cancels only stale open orders', () => {
  assert.deepEqual(cancelStaleOrders(new Date('2026-10-25T00:00:00Z'), 30), ['o-3'])
  assert.equal(findOrder('o-1')?.status, 'OPEN')
  assert.equal(findOrder('o-2')?.status, 'SHIPPED')
})
