import { afterAll, expect, it } from 'vitest'
import { createApp } from '../src/app.ts'
import { loadOperation, runOperation } from '../src/operations.ts'
import { startTestServer } from '../src/test-client.ts'

const { url, close } = await startTestServer(await createApp())
afterAll(close)
const run = runOperation(url)
const document = await loadOperation(
  new URL('./operations/order-overview.graphql', import.meta.url),
)

type OrderRow = { id: string; status: string; totalCents: number; customer: { name: string } }

it('aliases load placed (open) and paid orders in one request', async () => {
  const result = await run<{ open: OrderRow[]; paid: OrderRow[] }>(
    document,
    { first: 5 },
    'OrderOverview',
  )
  expect(result.errors).toBeUndefined()
  expect(result.data?.open.map((order) => order.id)).toEqual(['o-1', 'o-3'])
  expect(result.data?.paid.map((order) => order.id)).toEqual(['o-2', 'o-4'])
  expect(result.data?.paid[0]).toEqual({
    id: 'o-2',
    status: 'PAID',
    totalCents: 34900,
    customer: { name: 'Alan Turing' },
  })
})

it('@include switches items per variable', async () => {
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
  expect(withItems.data?.order.items?.length).toBe(2)
  expect('items' in (withoutItems.data?.order ?? {})).toBe(false)
})

it('a document with several operations needs operationName', async () => {
  const result = await run(document, { first: 1 })
  expect(result.errors?.[0]?.message ?? '').toMatch(/Must provide operation name/)
})
