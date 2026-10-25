import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createTestClient } from '../src/test-client.ts'
import { yoga } from './yoga.ts'

const execute = createTestClient(yoga)

test('DateTime serializes Date values to ISO strings', async () => {
  const result = await execute<{ orders: { placedAt: string }[] }>(`{ orders { placedAt } }`)
  assert.equal(result.data?.orders[1]?.placedAt, '2026-10-05T08:30:00.000Z')
})

test('DateTime parses variables (coerceInputValue)', async () => {
  const query = `query Recent($after: DateTime!) { orders(filter: { placedAfter: $after }) { id } }`
  const valid = await execute<{ orders: { id: string }[] }>(query, {
    after: '2026-10-04T00:00:00+02:00',
  })
  assert.deepEqual(valid.data?.orders, [{ id: 'o-2' }, { id: 'o-3' }])

  const invalid = await execute(query, { after: 'yesterday' })
  assert.equal(invalid.data, undefined)
  assert.match(invalid.errors?.[0]?.message ?? '', /RFC 3339/)
})

test('DateTime parses literals in the query text (coerceInputLiteral)', async () => {
  const invalid = await execute(`{ orders(filter: { placedAfter: "2026-10-04" }) { id } }`)
  assert.match(invalid.errors?.[0]?.message ?? '', /RFC 3339/)
})

test('EmailAddress from graphql-scalars rejects invalid addresses before the resolver runs', async () => {
  const mutation = `mutation Update($email: EmailAddress!) { updateContactEmail(orderId: "o-1", email: $email) { contactEmail } }`
  const invalid = await execute(mutation, { email: 'not-an-email' })
  assert.match(invalid.errors?.[0]?.message ?? '', /email/i)

  const valid = await execute<{ updateContactEmail: { contactEmail: string } }>(mutation, {
    email: 'grace@example.com',
  })
  assert.equal(valid.data?.updateContactEmail.contactEmail, 'grace@example.com')
})

test('@specifiedBy is visible via introspection', async () => {
  const result = await execute<{ __type: { specifiedByURL: string } }>(
    `{ __type(name: "DateTime") { specifiedByURL } }`,
  )
  assert.equal(result.data?.__type.specifiedByURL, 'https://www.rfc-editor.org/rfc/rfc3339')
})
