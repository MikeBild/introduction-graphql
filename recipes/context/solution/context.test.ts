import assert from 'node:assert'
import { afterAll, beforeEach, expect, it } from 'vitest'
import { db } from '../src/db.ts'
import { createLoaders } from '../src/loaders.ts'
import { startTestServer } from '../src/test-client.ts'
import { createApp, createServer } from './app.ts'
import type { Context } from './context.ts'

const { execute, close } = await startTestServer(await createApp())
afterAll(close)
beforeEach(() => db.resetQueries())

const productName = /* GraphQL */ `
  query ProductName {
    orders {
      items {
        product {
          name
        }
      }
    }
  }
`

it('starts every request with fresh loaders', async () => {
  type Data = { orders: { items: { product: { name: string } | null }[] }[] }
  await execute<Data>(productName)
  await db.products.rename('p-1', 'Claw hammer')

  const after = await execute<Data>(productName)
  expect(after.data?.orders[0].items[0].product?.name).toBe('Claw hammer')
  await db.products.rename('p-1', 'Hammer')
})

it('answers orders and orderCount with one database query', async () => {
  const result = await execute<{ orders: { id: string }[]; orderCount: number }>(/* GraphQL */ `
    query OrdersAndCount {
      orders {
        id
      }
      orderCount
    }
  `)
  expect(result.data?.orderCount).toBe(4)
  expect(db.queries()).toBe(1)
})

it('takes the request id from the context', async () => {
  const result = await execute<{ requestId: string }>(
    'query RequestId { requestId }',
    {},
    { 'x-request-id': 'req-42' },
  )
  expect(result.data?.requestId).toBe('req-42')
})

it('runs an operation with a fake context, without HTTP', async () => {
  const contextValue: Context = { requestId: 'test-1', loaders: createLoaders() }
  const response = await createServer().executeOperation(
    { query: 'query RequestId { requestId }' },
    { contextValue },
  )
  assert(response.body.kind === 'single')
  expect(response.body.singleResult.data).toEqual({ requestId: 'test-1' })
})
