import { beforeEach, expect, it } from 'vitest'
import { db } from './db.ts'
import { createTestClient } from './test-client.ts'
import { yoga } from './yoga.ts'

const execute = createTestClient(yoga)
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
