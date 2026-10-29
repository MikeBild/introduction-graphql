import { afterAll, beforeEach, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { startTestServer } from './test-client.ts'
import { db } from './db.ts'

const { execute, close } = await startTestServer(await createApp())
afterAll(close)
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

it('loads every order with the products of its items', async () => {
  const result = await execute<{
    orders: { id: string; items: { product: { name: string } | null }[] }[]
  }>(ordersWithProducts)
  expect(result.errors).toBeUndefined()
  expect(
    result.data?.orders.flatMap((order) => order.items.map((item) => item.product?.name ?? null)),
  ).toEqual(['Hammer', 'Screwdriver set', 'Hammer', 'Workbench', null])
})

it('needs 1 + N database queries: one for the list, one per order item', async () => {
  await execute(ordersWithProducts)
  // 1 x orders + 5 x products, even though p-1 appears twice
  expect(db.queries()).toBe(6)
})
