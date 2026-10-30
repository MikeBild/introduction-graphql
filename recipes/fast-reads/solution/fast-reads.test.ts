import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeEach, expect, it } from 'vitest'
import { seed } from '../src/seed.ts'
import { startTestServer } from '../src/test-client.ts'
import { createApp } from './app.ts'
import { createFastDb } from './db.ts'

const directory = mkdtempSync(join(tmpdir(), 'fast-reads-'))
const db = createFastDb(join(directory, 'shop.db'), { roundTripMs: 0 })
seed(db.database, { orders: 300, products: 20 })

const { execute, close } = await startTestServer(await createApp(db))
afterAll(async () => {
  await close()
  rmSync(directory, { recursive: true, force: true })
})
beforeEach(() => db.resetQueries())

type Page = {
  orders: {
    edges: {
      node: { id: string; items: { product: { name: string } | null }[] }
    }[]
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
  }
}

const ordersPage = /* GraphQL */ `
  query OrdersPage($first: Int, $after: String) {
    orders(first: $first, after: $after) {
      edges {
        node {
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
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

const ids = (page?: Page | null) => page?.orders.edges.map(({ node }) => node.id) ?? []

it('answers a page of 20 orders with 3 queries', async () => {
  await execute(ordersPage, { first: 20 })
  expect(db.queries()).toBe(3)
})

it('loads every product once, however many lines show it', async () => {
  const { data } = await execute<Page>(ordersPage, { first: 100 })
  const names = data?.orders.edges.flatMap(({ node }) => node.items.map((item) => item.product))
  expect(names?.length).toBeGreaterThan(new Set(names?.map((name) => name?.name)).size)
  expect(db.queries()).toBe(3)
})

it('returns null for a line item whose product no longer exists', async () => {
  db.orders.insert({ id: 'o-gone', status: 'PAID', created_at: '2027-01-02T00:00:00.000Z' })
  db.database.prepare(`insert into order_items values ('o-gone', 'p-404', 1, 990)`).run()

  const { data } = await execute<Page>(ordersPage, { first: 1 })
  expect(data?.orders.edges[0]?.node.items[0]?.product).toBeNull()

  db.database.prepare(`delete from order_items where order_id = 'o-gone'`).run()
  db.database.prepare(`delete from orders where id = 'o-gone'`).run()
})

it('keeps the next page stable when a new order arrives', async () => {
  const first = await execute<Page>(ordersPage, { first: 5 })
  db.orders.insert({ id: 'o-new', status: 'PLACED', created_at: '2027-01-01T00:00:00.000Z' })
  const second = await execute<Page>(ordersPage, {
    first: 5,
    after: first.data?.orders.pageInfo.endCursor,
  })
  db.database.prepare(`delete from orders where id = 'o-new'`).run()

  expect(ids(second.data)).toHaveLength(5)
  expect(ids(second.data).filter((id) => ids(first.data).includes(id))).toEqual([])
})

it('finds orders that share a timestamp with the cursor', async () => {
  const seen: string[] = []
  let after: string | null | undefined
  do {
    const { data } = await execute<Page>(ordersPage, { first: 7, after })
    seen.push(...ids(data))
    after = data?.orders.pageInfo.hasNextPage ? data.orders.pageInfo.endCursor : null
  } while (after)
  expect(seen).toHaveLength(300)
  expect(new Set(seen).size).toBe(300)
})

it('answers the page after a cursor from the index, without a sort step', () => {
  const plan = db.database
    .prepare(
      `explain query plan select id, status, created_at from orders
       where (created_at, id) < (?, ?) order by created_at desc, id desc limit ?`,
    )
    .all('2026-01-01T00:00:10.000Z', 'o-30', 20)
    .map((step) => String(step.detail))
    .join('\n')
  expect(plan).toContain('orders_newest_idx')
  expect(plan).not.toContain('TEMP B-TREE')
})

it('rejects a cursor it cannot read', async () => {
  const { errors } = await execute(ordersPage, { after: 'not-a-cursor' })
  expect(errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
})
