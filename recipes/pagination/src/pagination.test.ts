import { expect, it } from 'vitest'
import { createStore } from './store.ts'
import { createTestClient } from './test-client.ts'
import { createApp } from './yoga.ts'

type OrdersData = { orders: { id: string }[] }
const page = /* GraphQL */ `
  query OrdersPage($offset: Int!, $limit: Int!) {
    orders(offset: $offset, limit: $limit) {
      id
    }
  }
`

it('pages through the orders with offset and limit', async () => {
  const execute = createTestClient(createApp(createStore(5)))
  const first = await execute<OrdersData>(page, { offset: 0, limit: 2 })
  expect(first.data?.orders.map((order) => order.id)).toEqual(['o-0005', 'o-0004'])
})

it('shows an order twice when a new one arrives while paging', async () => {
  const store = createStore(5)
  const execute = createTestClient(createApp(store))
  const first = await execute<OrdersData>(page, { offset: 0, limit: 2 })
  store.place(99) // a new order lands at the top of the list
  const second = await execute<OrdersData>(page, { offset: 2, limit: 2 })
  expect(first.data?.orders.map((order) => order.id)).toEqual(['o-0005', 'o-0004'])
  expect(second.data?.orders.map((order) => order.id)).toEqual(['o-0004', 'o-0003'])
})

it('has no upper bound: a client can ask for everything', async () => {
  const execute = createTestClient(createApp(createStore(500)))
  const all = await execute<OrdersData>(page, { offset: 0, limit: 100_000 })
  expect(all.data?.orders).toHaveLength(500)
})
