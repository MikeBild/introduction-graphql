import { createHash } from 'node:crypto'
import { beforeEach, expect, it } from 'vitest'
import { load } from '../src/schema.ts'
import { createTestClient, type GraphQLResponse } from '../src/test-client.ts'
import { yoga } from './yoga.ts'

const asPartner = createTestClient({
  fetch: (url, init) =>
    yoga.fetch(url, { ...init, headers: { ...init.headers, 'x-partner-key': 'partner-secret' } }),
})
const asAnyone = createTestClient(yoga)

const sendPersisted = async (sha256Hash: string) => {
  const response = await yoga.fetch('http://localhost/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ extensions: { persistedQuery: { version: 1, sha256Hash } } }),
  })
  return (await response.json()) as GraphQLResponse<{ orders: unknown[] }>
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
  const adHoc = await asAnyone(`{ orders(first: 1) { id } }`)
  expect(adHoc.errors?.[0]?.message).toBe('PersistedQueryOnly')
})

it('partners may send own queries, but depth is limited', async () => {
  const result = await asPartner(
    `{ orders { customer { orders { customer { orders { customer { name } } } } } } }`,
  )
  expect(result.errors?.[0]?.message ?? '').toMatch(/depth limit of 5 exceeded/)
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
  expect(expensive.errors?.[0]?.extensions?.code).toBe('QUERY_TOO_EXPENSIVE')
})
