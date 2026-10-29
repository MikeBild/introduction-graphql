import { createHash } from 'node:crypto'
import { afterAll, beforeEach, expect, it } from 'vitest'
import { load } from '../src/schema.ts'
import { startTestServer } from '../src/test-client.ts'
import { createApp } from './app.ts'

const { url, execute, close } = await startTestServer(await createApp())
afterAll(close)
const partner = { 'x-partner-key': 'partner-secret' }
const asPartner = (query: string, variables: Record<string, unknown> = {}) =>
  execute(query, variables, partner)

const sendPersisted = async (sha256Hash: string) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ extensions: { persistedQuery: { version: 1, sha256Hash } } }),
  })
  return (await response.json()) as {
    data?: { orders: unknown[] }
    errors?: { message: string; extensions?: Record<string, unknown> }[]
  }
}

beforeEach(() => {
  load.resolvedOrders = 0
})

it('own clients send a hash from the manifest', async () => {
  const document = 'query OrdersPage { orders(first: 20) { id status customer { name } } }'
  const result = await sendPersisted(createHash('sha256').update(document).digest('hex'))
  expect(result.errors).toBeUndefined()
  expect(result.data?.orders.length).toBe(20)
})

it('unknown hashes and ad-hoc queries are rejected without a partner key', async () => {
  const unknown = await sendPersisted('0'.repeat(64))
  expect(unknown.errors?.[0]?.extensions?.code).toBe('PERSISTED_QUERY_NOT_IN_LIST')
  const adHoc = await execute(`{ orders(first: 1) { id } }`)
  expect(adHoc.status).toBe(400)
  expect(adHoc.errors?.[0]?.extensions?.code).toBe('PERSISTED_QUERY_ONLY')
})

it('partners may send own queries, but depth is limited', async () => {
  const result = await asPartner(
    `{ orders { customer { orders { customer { orders { customer { name } } } } } } }`,
  )
  expect(result.errors?.[0]?.message ?? '').toMatch(/depth limit of 5 exceeded/)
  expect(result.errors?.[0]?.extensions?.code).toBe('GRAPHQL_VALIDATION_FAILED')
  expect(load.resolvedOrders, 'rejected before the first resolver').toBe(0)
})

it('alias floods are rejected', async () => {
  const aliases = Array.from(
    { length: 50 },
    (_, index) => `a${index}: orders(first: 1) { id }`,
  ).join('\n')
  const result = await asPartner(`query Aliases { ${aliases} }`)
  expect(result.errors?.[0]?.message ?? '').toMatch(/Aliases limit of 5 exceeded/)
})

it('lists multiply the cost by their first argument, also via variables', async () => {
  const query = `query Nested($size: Int!) { orders(first: $size) { customer { orders(first: $size) { id } } } }`
  const cheap = await asPartner(query, { size: 10 })
  expect(cheap.errors).toBeUndefined()
  const expensive = await asPartner(query, { size: 100 })
  expect(expensive.status).toBe(400)
  expect(expensive.errors?.[0]?.extensions?.code).toBe('QUERY_TOO_EXPENSIVE')
  expect(load.resolvedOrders, 'the expensive one never reached a resolver').toBe(10 + 10 * 10)
})
