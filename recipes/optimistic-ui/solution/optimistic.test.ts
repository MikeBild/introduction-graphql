import { afterEach, expect, it, vi } from 'vitest'
import { createClient, createNetwork, watch } from '../src/client.ts'
import { createApp } from '../src/app.ts'
import { startTestServer } from '../src/test-client.ts'
import {
  cancelOrder,
  OrderDetailQuery,
  OrdersQuery,
  type OrderDetailData,
  type OrdersData,
} from './operations.ts'

const stops: (() => unknown)[] = []
afterEach(() => Promise.all(stops.splice(0).map((stop) => stop())))

const setup = async (orderId: string) => {
  const server = await startTestServer(await createApp())
  stops.push(server.close)
  const network = createNetwork(server.url)
  const client = createClient(network)
  const list = watch<OrdersData>(client, OrdersQuery)
  const detail = watch<OrderDetailData>(client, OrderDetailQuery, { id: orderId })
  stops.push(list.stop, detail.stop)
  await vi.waitFor(() => expect(list.current() && detail.current()).toBeTruthy())
  network.requests.length = 0
  const status = () => ({
    list: list.current()?.orders.find((order) => order.id === orderId)?.status,
    detail: detail.current()?.order?.status,
  })
  return { network, client, status }
}

it('optimistic: list and detail show CANCELLED before the server answers', async () => {
  const { network, client, status } = await setup('o-1')
  network.hold()
  const done = cancelOrder(client, 'o-1')
  await vi.waitFor(() => expect(status()).toEqual({ list: 'CANCELLED', detail: 'CANCELLED' }))

  network.release()
  await done
  expect(status()).toEqual({ list: 'CANCELLED', detail: 'CANCELLED' })
  // One request, no refetch: the payload updated the cache.
  expect(network.requests).toEqual(['CancelOrder'])
})

it('rolls back when the server rejects the mutation', async () => {
  const { network, client, status } = await setup('o-3')
  expect(status()).toEqual({ list: 'SHIPPED', detail: 'SHIPPED' })
  network.hold()
  const done = cancelOrder(client, 'o-3')
  await vi.waitFor(() => expect(status()).toEqual({ list: 'CANCELLED', detail: 'CANCELLED' }))

  network.release()
  await expect(done).rejects.toThrow(/o-3 is SHIPPED/)
  await vi.waitFor(() => expect(status()).toEqual({ list: 'SHIPPED', detail: 'SHIPPED' }))
})
