import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadOperation, runOperation } from '../src/operations.ts'
import { yoga } from '../src/yoga.ts'

const run = runOperation(yoga)
const document = await loadOperation(
  new URL('./operations/order-overview.graphql', import.meta.url),
)

type OrderRow = { id: string; status: string; total: number; customer: { name: string } }

test('aliases load open and paid orders in one request', async () => {
  const result = await run<{ open: OrderRow[]; paid: OrderRow[] }>(
    document,
    { first: 5 },
    'OrderOverview',
  )
  assert.equal(result.errors, undefined)
  assert.deepEqual(
    result.data?.open.map((order) => order.id),
    ['o-1', 'o-3'],
  )
  assert.deepEqual(
    result.data?.paid.map((order) => order.id),
    ['o-2', 'o-4'],
  )
  assert.deepEqual(result.data?.paid[0], {
    id: 'o-2',
    status: 'PAID',
    total: 349,
    customer: { name: 'Alan Turing' },
  })
})

test('@include switches items per variable', async () => {
  const withItems = await run<{ order: { items?: unknown[] } }>(
    document,
    { id: 'o-1', withItems: true },
    'OrderDetail',
  )
  const withoutItems = await run<{ order: { items?: unknown[] } }>(
    document,
    { id: 'o-1', withItems: false },
    'OrderDetail',
  )
  assert.equal(withItems.data?.order.items?.length, 2)
  assert.equal('items' in (withoutItems.data?.order ?? {}), false)
})

test('a document with several operations needs operationName', async () => {
  const result = await run(document, { first: 1 })
  assert.match(result.errors?.[0]?.message ?? '', /Could not determine what operation to execute/)
})
