import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { beforeEach, test } from 'node:test'
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

test('own clients send a hash from the manifest', async () => {
  const document = 'query OrdersPage { orders(first: 20) { id status customer { name } } }'
  const result = await sendPersisted(createHash('sha256').update(document).digest('hex'))
  assert.equal(result.errors, undefined)
  assert.equal(result.data?.orders.length, 20)
})

test('unknown hashes and ad-hoc queries are rejected without a partner key', async () => {
  const unknown = await sendPersisted('0'.repeat(64))
  assert.equal(unknown.errors?.[0]?.extensions?.code, 'PERSISTED_QUERY_NOT_IN_LIST')
  const adHoc = await asAnyone(`{ orders(first: 1) { id } }`)
  assert.equal(adHoc.errors?.[0]?.message, 'PersistedQueryOnly')
})

test('partners may send own queries, but depth is limited', async () => {
  const result = await asPartner(
    `{ orders { customer { orders { customer { orders { customer { name } } } } } } }`,
  )
  assert.match(result.errors?.[0]?.message ?? '', /depth limit of 5 exceeded/)
  assert.equal(load.resolvedOrders, 0, 'rejected before the first resolver')
})

test('alias floods are rejected', async () => {
  const aliases = Array.from(
    { length: 50 },
    (_, index) => `a${index}: orders(first: 1) { id }`,
  ).join('\n')
  const result = await asPartner(`query Aliases { ${aliases} }`)
  assert.match(result.errors?.[0]?.message ?? '', /Aliases limit of 5 exceeded/)
})

test('lists multiply the cost by their first argument, also via variables', async () => {
  const query = `query Nested($size: Int!) { orders(first: $size) { customer { orders(first: $size) { id } } } }`
  const cheap = await asPartner(query, { size: 10 })
  assert.equal(cheap.errors, undefined)
  const expensive = await asPartner(query, { size: 100 })
  assert.equal(expensive.errors?.[0]?.extensions?.code, 'QUERY_TOO_EXPENSIVE')
})
