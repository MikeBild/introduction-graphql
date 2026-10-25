import assert from 'node:assert/strict'
import { test } from 'node:test'
import { yoga } from './bff-web.ts'
import { createTestClient } from './test-client.ts'

const execute = createTestClient(yoga)

test('the web BFF serves exactly what the order page shows', async () => {
  const result = await execute(
    `query OrderPage { orderPage(id: "o-1") { id customerName canCancel } }`,
  )
  assert.deepEqual(result.data, {
    orderPage: { id: 'o-1', customerName: 'Ada Lovelace', canCancel: true },
  })
})

test('the cancel rule is enforced – but only inside the web resolver', async () => {
  const shipped = await execute(`mutation Cancel { cancelOrder(id: "o-2") { status } }`)
  assert.equal(shipped.errors?.[0]?.extensions?.code, 'NOT_CANCELLABLE')
  const open = await execute(`mutation Cancel { cancelOrder(id: "o-1") { status canCancel } }`)
  assert.deepEqual(open.data, { cancelOrder: { status: 'CANCELLED', canCancel: false } })
})
