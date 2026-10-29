import { expect, it } from 'vitest'
import { createStore } from '../src/store.ts'
import { createTestClient } from '../src/test-client.ts'
import { createApp } from './yoga.ts'

type OrdersData = {
  orders: {
    edges: { cursor: string; node: { id: string } }[]
    pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean; endCursor: string | null }
  }
}
const page = /* GraphQL */ `
  query OrdersPage($first: Int, $after: String) {
    orders(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
      }
    }
  }
`
const ids = (result: { data?: OrdersData | null }) =>
  result.data?.orders.edges.map((edge) => edge.node.id)

it('pages forward with first and after until hasNextPage is false', async () => {
  const execute = createTestClient(createApp(createStore(5)))
  const first = await execute<OrdersData>(page, { first: 2 })
  expect(ids(first)).toEqual(['o-0005', 'o-0004'])
  expect(first.data?.orders.pageInfo).toMatchObject({ hasNextPage: true, hasPreviousPage: false })

  const second = await execute<OrdersData>(page, {
    first: 2,
    after: first.data?.orders.pageInfo.endCursor,
  })
  expect(ids(second)).toEqual(['o-0003', 'o-0002'])

  const last = await execute<OrdersData>(page, {
    first: 2,
    after: second.data?.orders.pageInfo.endCursor,
  })
  expect(ids(last)).toEqual(['o-0001'])
  expect(last.data?.orders.pageInfo).toMatchObject({ hasNextPage: false, hasPreviousPage: true })
})

it('reports no next page when the last page is exactly full', async () => {
  const execute = createTestClient(createApp(createStore(4)))
  const first = await execute<OrdersData>(page, { first: 2 })
  const second = await execute<OrdersData>(page, {
    first: 2,
    after: first.data?.orders.pageInfo.endCursor,
  })
  expect(ids(second)).toEqual(['o-0002', 'o-0001'])
  expect(second.data?.orders.pageInfo.hasNextPage).toBe(false)
})

it('a new order on top does not shift the next page', async () => {
  const store = createStore(5)
  const execute = createTestClient(createApp(store))
  const first = await execute<OrdersData>(page, { first: 2 })
  store.place(99)
  const second = await execute<OrdersData>(page, {
    first: 2,
    after: first.data?.orders.pageInfo.endCursor,
  })
  expect(ids(second)).toEqual(['o-0003', 'o-0002'])
})

it('caps first at 100', async () => {
  const execute = createTestClient(createApp(createStore(500)))
  const result = await execute<OrdersData>(page, { first: 100_000 })
  expect(result.data?.orders.edges).toHaveLength(100)
  expect(result.data?.orders.pageInfo.hasNextPage).toBe(true)
})

it('rejects a cursor it did not issue', async () => {
  const execute = createTestClient(createApp(createStore(5)))
  const result = await execute<OrdersData>(page, { first: 2, after: 'not-a-cursor' })
  expect(result.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
})
