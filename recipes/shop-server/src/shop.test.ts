import { afterAll, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { startTestServer } from './test-client.ts'

const { execute, close } = await startTestServer(await createApp())
afterAll(close)

it('answers orders with their total in cents', async () => {
  const result = await execute<{ orders: { id: string; status: string; totalCents: number }[] }>(
    `query { orders { id status totalCents } }`,
  )
  expect(result.data?.orders[0]).toEqual({ id: 'o-1', status: 'PLACED', totalCents: 2580 })
})

it('Query.products has no resolver yet: the non-null list fails', async () => {
  const result = await execute(`query { products { id } }`)
  expect(result.status).toBe(200)
  expect(result.data).toBeNull()
  expect(result.errors?.[0]?.path).toEqual(['products'])
  // Apollo Server passes the internal message on to the client.
  expect(result.errors?.[0]?.message).toMatch(/Cannot return null for non-nullable field/)
})
