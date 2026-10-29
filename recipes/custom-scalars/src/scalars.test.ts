import { afterAll, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { startTestServer } from './test-client.ts'

const { execute, close } = await startTestServer(await createApp())
afterAll(close)

it('createdAt is returned as an ISO string', async () => {
  const result = await execute<{ orders: { id: string; createdAt: string }[] }>(
    `{ orders { id createdAt } }`,
  )
  expect(result.data?.orders[1]?.createdAt).toBe('2026-10-05T08:30:00.000Z')
})

it('String accepts any text – "not-an-email" is stored without complaint', async () => {
  const result = await execute<{ updateCustomerEmail: { email: string } }>(
    `mutation Update($email: String!) { updateCustomerEmail(customerId: "c-1", email: $email) { email } }`,
    { email: 'not-an-email' },
  )
  expect(result.errors).toBeUndefined()
  expect(result.data?.updateCustomerEmail.email).toBe('not-an-email')
})

it('an invalid date filter silently becomes "Invalid Date" and matches nothing', async () => {
  const result = await execute<{ orders: unknown[] }>(
    `{ orders(filter: { createdAfter: "yesterday" }) { id } }`,
  )
  expect(result.errors).toBeUndefined()
  expect(result.data?.orders).toEqual([])
})
