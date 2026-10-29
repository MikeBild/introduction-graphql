import { afterAll, beforeEach, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { startTestServer } from '../src/test-client.ts'
import { db } from '../src/db.ts'
import { createLoaders } from './loaders.ts'

const { execute, close } = await startTestServer(await createApp())
afterAll(close)
type OrdersData = { orders: { id: string; items: { product: { name: string } | null }[] }[] }
const ordersWithProducts = /* GraphQL */ `
  query OrdersWithProducts {
    orders {
      id
      items {
        product {
          name
        }
      }
    }
  }
`

beforeEach(() => db.resetQueries())

it('needs exactly two database queries for the list with products', async () => {
  const result = await execute<OrdersData>(ordersWithProducts)
  expect(result.errors).toBeUndefined()
  expect(
    result.data?.orders.flatMap((order) => order.items.map((item) => item.product?.name ?? null)),
  ).toEqual(['Hammer', 'Screwdriver set', 'Hammer', 'Workbench', null])
  expect(db.queries()).toBe(2)
})

it('creates fresh loaders per request: no cache across requests', async () => {
  await execute(ordersWithProducts)
  await execute(ordersWithProducts)
  expect(db.queries()).toBe(4)
})

it('returns results in key order, with null for missing keys', async () => {
  const { product } = createLoaders()
  // findByIds returns table order (p-1, p-3), the loader must map it back to the keys.
  const rows = await product.loadMany(['p-3', 'p-404', 'p-1'])
  expect(rows.map((row) => (row && 'name' in row ? row.name : null))).toEqual([
    'Workbench',
    null,
    'Hammer',
  ])
  expect(db.queries()).toBe(1)
})

it('clears the loader after a mutation, so the payload shows the new name', async () => {
  const result = await execute<{ renameProduct: { name: string } | null }>(/* GraphQL */ `
    mutation Rename {
      renameProduct(id: "p-2", name: "Screwdriver set, 12 pieces") {
        name
      }
    }
  `)
  expect(result.data?.renameProduct).toEqual({ name: 'Screwdriver set, 12 pieces' })
})
