import { afterAll, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { startTestServer } from './test-server.ts'

const { execute, close } = await startTestServer(await createApp())
afterAll(close)

type OrderData = { order: { status: string } | null }
const orderStatus = `query OrderStatus($id: ID!) { order(id: $id) { status } }`

it('pays and ships an order along the status flow', async () => {
  await execute(`mutation { payOrder(id: "o-1") { id } }`)
  expect((await execute<OrderData>(orderStatus, { id: 'o-1' })).data?.order?.status).toBe('PAID')
  const skipped = await execute(`mutation { shipOrder(id: "o-2") { id } }`)
  expect(skipped.errors?.[0]?.message).toBe('Only PAID orders can become SHIPPED')
})

it('a client only learns about a new status by asking again (polling)', async () => {
  const before = await execute<OrderData>(orderStatus, { id: 'o-2' })
  await execute(`mutation { payOrder(id: "o-2") { id } }`)
  expect(before.data?.order?.status).toBe('PLACED')
  const after = await execute<OrderData>(orderStatus, { id: 'o-2' })
  expect(after.data?.order?.status).toBe('PAID')
})

it('there is no Subscription type yet', async () => {
  const result = await execute(`subscription { orderStatusChanged(orderId: "o-1") { status } }`)
  expect(result.errors?.[0]?.message).toMatch(/not configured to execute subscription/)
})
