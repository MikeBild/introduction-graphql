import { gql, type TypedDocumentNode } from '@apollo/client'
import { createClient } from 'graphql-ws'
import { afterAll, expect, it, vi } from 'vitest'
import { startTestServer } from '../src/test-server.ts'
import { createApp } from './app.ts'
import { createShopClient } from './client.ts'

const { url, wsUrl, execute, close } = await startTestServer(await createApp())
const disposers: (() => unknown)[] = []
afterAll(async () => {
  await Promise.all(disposers.map((dispose) => dispose()))
  await close()
})

const orderStatusChanged = `subscription OrderStatus($orderId: ID!) {
  orderStatusChanged(orderId: $orderId) { id status }
}`

// Collects every event of one subscription over a plain graphql-ws client.
const subscribe = (orderId: string) => {
  const ws = createClient({ url: wsUrl })
  disposers.push(() => ws.dispose())
  const events: { id: string; status: string }[] = []
  ws.subscribe<{ orderStatusChanged: { id: string; status: string } }>(
    { query: orderStatusChanged, variables: { orderId } },
    {
      next: ({ data }) => data && events.push(data.orderStatusChanged),
      error: () => {},
      complete: () => {},
    },
  )
  return events
}
// The subscription is only active once the server has acknowledged it.
const settle = () => new Promise((resolve) => setTimeout(resolve, 100))

it('pushes the new status to the subscriber of this order', async () => {
  const events = subscribe('o-1')
  await settle()
  await execute(`mutation { payOrder(id: "o-1") { id } }`)
  await execute(`mutation { shipOrder(id: "o-1") { id } }`)
  await vi.waitFor(() =>
    expect(events).toEqual([
      { id: 'o-1', status: 'PAID' },
      { id: 'o-1', status: 'SHIPPED' },
    ]),
  )
})

it('filters by orderId: changes of other orders do not arrive', async () => {
  const events = subscribe('o-1')
  await settle()
  await execute(`mutation { payOrder(id: "o-2") { id } }`)
  await settle()
  expect(events).toEqual([])
})

it('Apollo Client: the split link sends the subscription over WebSocket', async () => {
  const { client, dispose } = createShopClient(url, wsUrl)
  disposers.push(dispose)
  const query: TypedDocumentNode<{ orderStatusChanged: { id: string; status: string } }> =
    gql(orderStatusChanged)
  const statuses: string[] = []
  const subscription = client
    .subscribe({ query, variables: { orderId: 'o-2' } })
    .subscribe(({ data }) => data && statuses.push(data.orderStatusChanged.status))
  disposers.push(() => subscription.unsubscribe())
  await settle()
  await execute(`mutation { shipOrder(id: "o-2") { id } }`)
  await vi.waitFor(() => expect(statuses).toEqual(['SHIPPED']))
})
