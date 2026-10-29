import { afterAll, expect, it } from 'vitest'
import { startTestServer } from '../src/test-client.ts'
import { createApp } from './app.ts'

const { execute, close } = await startTestServer(await createApp())
afterAll(close)

it('DateTime serializes Date values to ISO strings (serialize)', async () => {
  const result = await execute<{ orders: { createdAt: string }[] }>(`{ orders { createdAt } }`)
  expect(result.data?.orders[1]?.createdAt).toBe('2026-10-05T08:30:00.000Z')
})

it('DateTime parses variables (parseValue)', async () => {
  const query = `query Recent($after: DateTime!) { orders(filter: { createdAfter: $after }) { id } }`
  const valid = await execute<{ orders: { id: string }[] }>(query, {
    after: '2026-10-04T00:00:00+02:00',
  })
  expect(valid.data?.orders).toEqual([{ id: 'o-2' }, { id: 'o-3' }])

  const invalid = await execute(query, { after: 'yesterday' })
  expect(invalid.status).toBe(400)
  expect(invalid.data).toBeUndefined()
  expect(invalid.errors?.[0]?.message ?? '').toMatch(/RFC 3339/)
})

it('DateTime parses literals in the query text (parseLiteral)', async () => {
  const invalid = await execute(`{ orders(filter: { createdAfter: "2026-10-04" }) { id } }`)
  expect(invalid.errors?.[0]?.message ?? '').toMatch(/RFC 3339/)
})

it('EmailAddress from graphql-scalars rejects invalid addresses before the resolver runs', async () => {
  const mutation = `mutation Update($email: EmailAddress!) { updateCustomerEmail(customerId: "c-1", email: $email) { email } }`
  const invalid = await execute(mutation, { email: 'not-an-email' })
  expect(invalid.errors?.[0]?.message ?? '').toMatch(/email/i)

  const valid = await execute<{ updateCustomerEmail: { email: string } }>(mutation, {
    email: 'grace@example.com',
  })
  expect(valid.data?.updateCustomerEmail.email).toBe('grace@example.com')
})

it('@specifiedBy is visible via introspection', async () => {
  const result = await execute<{ __type: { specifiedByURL: string } }>(
    `{ __type(name: "DateTime") { specifiedByURL } }`,
  )
  expect(result.data?.__type.specifiedByURL).toBe('https://www.rfc-editor.org/rfc/rfc3339')
})
