import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createTestClient } from './test-client.ts'
import { yoga } from './yoga.ts'

const execute = createTestClient(yoga)

test('placedAt is returned as an ISO string', async () => {
  const result = await execute<{ orders: { id: string; placedAt: string }[] }>(
    `{ orders { id placedAt } }`,
  )
  assert.equal(result.data?.orders[1]?.placedAt, '2026-10-05T08:30:00.000Z')
})

test('String accepts any text – "not-an-email" is stored without complaint', async () => {
  const result = await execute<{ updateContactEmail: { contactEmail: string } }>(
    `mutation Update($email: String!) { updateContactEmail(orderId: "o-1", email: $email) { contactEmail } }`,
    { email: 'not-an-email' },
  )
  assert.equal(result.errors, undefined)
  assert.equal(result.data?.updateContactEmail.contactEmail, 'not-an-email')
})

test('an invalid date filter silently becomes "Invalid Date" and matches nothing', async () => {
  const result = await execute<{ orders: unknown[] }>(
    `{ orders(filter: { placedAfter: "yesterday" }) { id } }`,
  )
  assert.equal(result.errors, undefined)
  assert.deepEqual(result.data?.orders, [])
})
