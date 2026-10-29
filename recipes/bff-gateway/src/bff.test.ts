import { afterAll, expect, it } from 'vitest'
import { createWebBff } from './bff-web.ts'
import { startTestServer } from './test-client.ts'

const { execute: client, close } = await startTestServer(await createWebBff())
afterAll(close)
// as customer c-1 (Ada Lovelace)
const execute = (query: string) => client(query, {}, { authorization: 'c-1' })

it('the web BFF serves exactly what the order page shows', async () => {
  const result = await execute(
    `query OrderPage { orderPage(id: "o-1") { id totalCents customerName canCancel } }`,
  )
  expect(result.data).toEqual({
    orderPage: { id: 'o-1', totalCents: 2580, customerName: 'Ada Lovelace', canCancel: true },
  })
})

it('the cancel rule is enforced – but only inside the web resolver', async () => {
  const placed = await execute(`mutation Cancel { cancelOrder(id: "o-1") { status canCancel } }`)
  expect(placed.data).toEqual({ cancelOrder: { status: 'CANCELLED', canCancel: false } })
})

it('customers see and cancel only their own orders', async () => {
  const foreign = await execute(`mutation Cancel { cancelOrder(id: "o-2") { status } }`)
  expect(foreign.errors?.[0]?.extensions?.code).toBe('NOT_FOUND')
  const foreignPage = await execute(`query OrderPage { orderPage(id: "o-2") { id } }`)
  expect(foreignPage.data).toEqual({ orderPage: null })
  const anonymous = await client(`query OrderPage { orderPage(id: "o-1") { id } }`)
  expect(anonymous.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
})
