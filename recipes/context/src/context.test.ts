import { afterAll, beforeEach, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { db } from './db.ts'
import { startTestServer } from './test-client.ts'

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

it('shows the old name after a rename, because the loader cache outlives the request', async () => {
  type Data = { orders: { items: { product: { name: string } | null }[] }[] }
  const before = await execute<Data>(productName)
  expect(before.data?.orders[0].items[0].product?.name).toBe('Hammer')

  await db.products.rename('p-1', 'Claw hammer')

  const after = await execute<Data>(productName)
  expect(after.data?.orders[0].items[0].product?.name).toBe('Hammer')
  await db.products.rename('p-1', 'Hammer')
})

it('counts zero orders: orderCount does not wait for the resolver that writes the context', async () => {
  const result = await execute<{ orders: { id: string }[]; orderCount: number }>(/* GraphQL */ `
    query OrdersAndCount {
      orders {
        id
      }
      orderCount
    }
  `)
  expect(result.data?.orders).toHaveLength(4)
  expect(result.data?.orderCount).toBe(0)
})

it('ignores the x-request-id header', async () => {
  const result = await execute<{ requestId: string }>(
    'query RequestId { requestId }',
    {},
    { 'x-request-id': 'req-42' },
  )
  expect(result.data?.requestId).not.toBe('req-42')
})

// Your turn, see the exercise in README.md.
it.todo('starts every request with fresh loaders')
it.todo('answers orders and orderCount with one database query')
it.todo('takes the request id from the context')
it.todo('runs an operation with a fake context, without HTTP')
