import assert from 'node:assert/strict'
import { test } from 'node:test'
import { yoga } from './bff-web.ts'
import { createTestClient } from './test-client.ts'

const client = createTestClient(yoga)
// as customer c-1 (Ada Lovelace)
const execute = (query: string) => client(query, {}, { authorization: 'c-1' })

test('the web BFF serves exactly what the order page shows', async () => {
  const result = await execute(
    `query OrderPage { orderPage(id: "o-1") { id customerName canCancel } }`,
  )
  assert.deepEqual(result.data, {
    orderPage: { id: 'o-1', customerName: 'Ada Lovelace', canCancel: true },
  })
})

test('the cancel rule is enforced – but only inside the web resolver', async () => {
  const open = await execute(`mutation Cancel { cancelOrder(id: "o-1") { status canCancel } }`)
  assert.deepEqual(open.data, { cancelOrder: { status: 'CANCELLED', canCancel: false } })
})

test('customers see and cancel only their own orders', async () => {
  const foreign = await execute(`mutation Cancel { cancelOrder(id: "o-2") { status } }`)
  assert.equal(foreign.errors?.[0]?.extensions?.code, 'NOT_FOUND')
  const foreignPage = await execute(`query OrderPage { orderPage(id: "o-2") { id } }`)
  assert.deepEqual(foreignPage.data, { orderPage: null })
  const anonymous = await client(`query OrderPage { orderPage(id: "o-1") { id } }`)
  assert.equal(anonymous.errors?.[0]?.extensions?.code, 'UNAUTHENTICATED')
})
