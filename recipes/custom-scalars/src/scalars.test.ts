import { expect, it } from 'vitest'
import { createTestClient } from './test-client.ts'
import { yoga } from './yoga.ts'

const execute = createTestClient(yoga)

it('placedAt is returned as an ISO string', async () => {
  const result = await execute<{ orders: { id: string; placedAt: string }[] }>(
    `{ orders { id placedAt } }`,
  )
  expect(result.data?.orders[1]?.placedAt).toBe('2026-10-05T08:30:00.000Z')
})

it('String accepts any text – "not-an-email" is stored without complaint', async () => {
  const result = await execute<{ updateContactEmail: { contactEmail: string } }>(
    `mutation Update($email: String!) { updateContactEmail(orderId: "o-1", email: $email) { contactEmail } }`,
    { email: 'not-an-email' },
  )
  expect(result.errors).toBeUndefined()
  expect(result.data?.updateContactEmail.contactEmail).toBe('not-an-email')
})

it('an invalid date filter silently becomes "Invalid Date" and matches nothing', async () => {
  const result = await execute<{ orders: unknown[] }>(
    `{ orders(filter: { placedAfter: "yesterday" }) { id } }`,
  )
  expect(result.errors).toBeUndefined()
  expect(result.data?.orders).toEqual([])
})
