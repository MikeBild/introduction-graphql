import { expect, it } from 'vitest'
import { loadOperation, runOperation } from '../src/operations.ts'
import { yoga } from '../src/yoga.ts'

const run = runOperation(yoga)
const document = await loadOperation(
  new URL('./operations/order-overview.graphql', import.meta.url),
)

type OrderRow = { id: string; status: string; total: number; customer: { name: string } }

it('aliases load open and paid orders in one request', async () => {
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
    total: 349,
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
  expect(result.errors?.[0]?.message ?? '').toMatch(/Could not determine what operation to execute/)
})
