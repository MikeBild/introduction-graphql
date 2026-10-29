import { afterAll, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { createStore } from './store.ts'
import { startTestServer } from './test-client.ts'

type OrdersData = { orders: { id: string }[] }
const page = /* GraphQL */ `
  query OrdersPage($offset: Int!, $limit: Int!) {
    orders(offset: $offset, limit: $limit) {
      id
    }
  }
`
const closes: (() => Promise<void>)[] = []
afterAll(() => Promise.all(closes.map((close) => close())))
const start = async (store = createStore()) => {
  const server = await startTestServer(await createApp(store))
  closes.push(server.close)
  return server.execute
}

it('pages through the orders with offset and limit', async () => {
  const execute = await start(createStore(5))
  const first = await execute<OrdersData>(page, { offset: 0, limit: 2 })
  expect(first.data?.orders.map((order) => order.id)).toEqual(['o-0005', 'o-0004'])
})

it('shows an order twice when a new one arrives while paging', async () => {
  const store = createStore(5)
  const execute = await start(store)
  const first = await execute<OrdersData>(page, { offset: 0, limit: 2 })
  store.place(99) // a new order lands at the top of the list
  const second = await execute<OrdersData>(page, { offset: 2, limit: 2 })
  expect(first.data?.orders.map((order) => order.id)).toEqual(['o-0005', 'o-0004'])
  expect(second.data?.orders.map((order) => order.id)).toEqual(['o-0004', 'o-0003'])
})

it('has no upper bound: a client can ask for everything', async () => {
  const execute = await start(createStore(500))
  const all = await execute<OrdersData>(page, { offset: 0, limit: 100_000 })
  expect(all.data?.orders).toHaveLength(500)
})
