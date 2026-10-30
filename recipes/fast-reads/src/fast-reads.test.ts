import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeEach, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { createDb } from './db.ts'
import { seed } from './seed.ts'
import { startTestServer } from './test-client.ts'

// A small database of its own, the file from npm run seed stays out of the tests.
const directory = mkdtempSync(join(tmpdir(), 'fast-reads-'))
const db = createDb(join(directory, 'shop.db'), { roundTripMs: 0 })
seed(db.database, { orders: 300, products: 20 })

const { execute, close } = await startTestServer(await createApp(db))
afterAll(async () => {
  await close()
  rmSync(directory, { recursive: true, force: true })
})
beforeEach(() => db.resetQueries())

type Page = { orders: { id: string }[] }

const ordersPage = /* GraphQL */ `
  query OrdersPage($first: Int, $offset: Int) {
    orders(first: $first, offset: $offset) {
      id
      totalCents
      items {
        quantity
        product {
          name
        }
      }
    }
  }
`

it('costs 1 + 2 per order + 1 per line item: 82 queries for a page of 20 orders', async () => {
  await execute(ordersPage, { first: 20 })
  expect(db.queries()).toBe(82)
})

it('shows an order twice when a new order arrives between two pages', async () => {
  const first = await execute<Page>(ordersPage, { first: 5 })
  db.orders.insert({ id: 'o-new', status: 'PLACED', created_at: '2027-01-01T00:00:00.000Z' })
  const second = await execute<Page>(ordersPage, { first: 5, offset: 5 })
  db.database.prepare(`delete from orders where id = 'o-new'`).run()

  expect(second.data?.orders[0]?.id).toBe(first.data?.orders[4]?.id)
})

// Your turn, see the exercise in README.md.
it.todo('answers a page of 20 orders with 3 queries')
it.todo('loads every product once, however many lines show it')
it.todo('returns null for a line item whose product no longer exists')
it.todo('keeps the next page stable when a new order arrives')
it.todo('finds orders that share a timestamp with the cursor')
it.todo('answers the page after a cursor from the index, without a sort step')
it.todo('rejects a cursor it cannot read')
