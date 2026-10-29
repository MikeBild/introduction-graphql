import { beforeEach, expect, it } from 'vitest'
import { db } from '../src/db.ts'
import { createTestClient } from '../src/test-client.ts'
import { createLoaders } from './loaders.ts'
import { yoga } from './yoga.ts'

const execute = createTestClient(yoga)
type OrdersData = { orders: { id: string; customer: { name: string } | null }[] }
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

it('needs exactly two database queries for the list with customers', async () => {
  const result = await execute<OrdersData>(ordersWithCustomers)
  expect(result.errors).toBeUndefined()
  expect(result.data?.orders.map((order) => order.customer?.name ?? null)).toEqual([
    'Ada Lovelace',
    'Grace Hopper',
    'Ada Lovelace',
    'Alan Turing',
    null,
  ])
  expect(db.queries()).toBe(2)
})

it('creates fresh loaders per request: no cache across requests', async () => {
  await execute(ordersWithCustomers)
  await execute(ordersWithCustomers)
  expect(db.queries()).toBe(4)
})

it('returns results in key order, with null for missing keys', async () => {
  const { customer } = createLoaders()
  // findByIds returns table order (c-1, c-3), the loader must map it back to the keys.
  const rows = await customer.loadMany(['c-3', 'c-404', 'c-1'])
  expect(rows.map((row) => (row && 'name' in row ? row.name : null))).toEqual([
    'Alan Turing',
    null,
    'Ada Lovelace',
  ])
  expect(db.queries()).toBe(1)
})

it('clears the loader after a mutation, so the payload shows the new name', async () => {
  const result = await execute<{ renameCustomer: { name: string } | null }>(/* GraphQL */ `
    mutation Rename {
      renameCustomer(id: "c-2", name: "Grace B. Hopper") {
        name
      }
    }
  `)
  expect(result.data?.renameCustomer).toEqual({ name: 'Grace B. Hopper' })
})
