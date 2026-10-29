import { expect, it } from 'vitest'
import { yoga } from './bff-web.ts'
import { createTestClient } from './test-client.ts'

const client = createTestClient(yoga)
// as customer c-1 (Ada Lovelace)
const execute = (query: string) => client(query, {}, { authorization: 'c-1' })

it('the web BFF serves exactly what the order page shows', async () => {
  const result = await execute(
    `query OrderPage { orderPage(id: "o-1") { id customerName canCancel } }`,
  )
  expect(result.data).toEqual({
    orderPage: { id: 'o-1', customerName: 'Ada Lovelace', canCancel: true },
  })
})

it('the cancel rule is enforced – but only inside the web resolver', async () => {
  const open = await execute(`mutation Cancel { cancelOrder(id: "o-1") { status canCancel } }`)
  expect(open.data).toEqual({ cancelOrder: { status: 'CANCELLED', canCancel: false } })
})

it('customers see and cancel only their own orders', async () => {
  const foreign = await execute(`mutation Cancel { cancelOrder(id: "o-2") { status } }`)
  expect(foreign.errors?.[0]?.extensions?.code).toBe('NOT_FOUND')
  const foreignPage = await execute(`query OrderPage { orderPage(id: "o-2") { id } }`)
  expect(foreignPage.data).toEqual({ orderPage: null })
  const anonymous = await client(`query OrderPage { orderPage(id: "o-1") { id } }`)
  expect(anonymous.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
})
