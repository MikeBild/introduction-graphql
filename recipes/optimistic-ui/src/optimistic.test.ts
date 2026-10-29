import { afterEach, expect, it, vi } from 'vitest'
import { createClient, createNetwork, watch } from './client.ts'
import {
  cancelOrder,
  OrderDetailQuery,
  OrdersQuery,
  type OrderDetailData,
  type OrdersData,
} from './operations.ts'
import { createApp } from './app.ts'
import { startTestServer } from './test-client.ts'

const stops: (() => unknown)[] = []
afterEach(() => Promise.all(stops.splice(0).map((stop) => stop())))

const setup = async () => {
  const server = await startTestServer(await createApp())
  stops.push(server.close)
  const network = createNetwork(server.url)
  const client = createClient(network)
  const list = watch<OrdersData>(client, OrdersQuery)
  const detail = watch<OrderDetailData>(client, OrderDetailQuery, { id: 'o-1' })
  stops.push(list.stop, detail.stop)
  await vi.waitFor(() => expect(list.current() && detail.current()).toBeTruthy())
  const status = () => ({
    list: list.current()?.orders.find((order) => order.id === 'o-1')?.status,
    detail: detail.current()?.order?.status,
  })
  return { network, client, status }
}

it('the list and the detail view share the same order in the cache', async () => {
  const { network, status } = await setup()
  expect(network.requests.toSorted()).toEqual(['OrderDetail', 'Orders'])
  expect(status()).toEqual({ list: 'OPEN', detail: 'OPEN' })
})

it('cancel with refetch: the UI waits for the server, then needs two more requests', async () => {
  const { network, client, status } = await setup()
  network.requests.length = 0
  network.hold()
  const done = cancelOrder(client, 'o-1')
  await new Promise((resolve) => setTimeout(resolve, 20))
  // The user clicked, nothing happens until the server answers.
  expect(status()).toEqual({ list: 'OPEN', detail: 'OPEN' })
  network.release()
  await done
  expect(status()).toEqual({ list: 'CANCELLED', detail: 'CANCELLED' })
  expect(network.requests.toSorted()).toEqual(['CancelOrder', 'OrderDetail', 'Orders'])
})
