import { afterAll, beforeEach, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { startTestServer } from './test-client.ts'
import { db } from './db.ts'

const { execute, close } = await startTestServer(await createApp())
afterAll(close)
const ordersWithCustomers = /* GraphQL */ `
  query OrdersWithCustomers {
    orders {
      id
      customer {
        name
      }
    }
  }
`

beforeEach(() => db.resetQueries())

it('loads every order and its customer', async () => {
  const result = await execute<{ orders: { id: string; customer: { name: string } | null }[] }>(
    ordersWithCustomers,
  )
  expect(result.errors).toBeUndefined()
  expect(result.data?.orders.map((order) => order.customer?.name ?? null)).toEqual([
    'Ada Lovelace',
    'Grace Hopper',
    'Ada Lovelace',
    'Alan Turing',
    null,
  ])
})

it('needs 1 + N database queries: one for the list, one per order', async () => {
  await execute(ordersWithCustomers)
  // 1 x orders + 5 x customers, even though c-1 appears twice
  expect(db.queries()).toBe(6)
})
