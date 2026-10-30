import assert from 'node:assert'
import { afterAll, beforeEach, expect, it } from 'vitest'
import type { Context, Viewer } from '../src/context.ts'
import { db } from '../src/db.ts'
import { createLoaders } from '../src/loaders.ts'
import { startTestServer } from '../src/test-client.ts'
import { createApp, createServer } from './app.ts'
import { canCancel } from './logic.ts'

const { execute, close } = await startTestServer(await createApp())
afterAll(close)
beforeEach(() => db.reset())

const ada: Viewer = { id: 'c-1', name: 'Ada', roles: ['CUSTOMER'] }
const grace: Viewer = { id: 'c-2', name: 'Grace', roles: ['CUSTOMER'] }
const linus: Viewer = { id: 's-1', name: 'Linus', roles: ['SUPPORT'] }

const contextFor = (viewer: Viewer | null): Context => ({ viewer, loaders: createLoaders() })

const myOrders = /* GraphQL */ `
  query MyOrders {
    me {
      name
      orders {
        id
        viewerCanCancel
      }
    }
  }
`
type MyOrders = {
  me: { name: string; orders: { id: string; viewerCanCancel: boolean }[] } | null
}

const run = async <TData>(query: string, viewer: Viewer | null) => {
  const response = await createServer().executeOperation<TData>(
    { query },
    { contextValue: contextFor(viewer) },
  )
  assert(response.body.kind === 'single')
  return response.body.singleResult
}

const cancel = (orderId: string) => /* GraphQL */ `
  mutation Cancel {
    cancelOrder(input: { orderId: "${orderId}" }) {
      __typename
      ... on CancelOrderSuccess {
        order {
          status
          viewerCanCancel
        }
      }
    }
  }
`
type Cancel = {
  cancelOrder: { __typename: string; order?: { status: string; viewerCanCancel: boolean } }
}

it('answers me with null without a sign-in', async () => {
  const result = await execute<MyOrders>(myOrders)
  expect(result.errors).toBeUndefined()
  expect(result.data?.me).toBeNull()
})

it('takes the identity from the request', async () => {
  const result = await execute<MyOrders>(myOrders, {}, { 'x-viewer-id': 'c-1' })
  expect(result.data?.me?.name).toBe('Ada')
})

it('gives Ada and Grace different orders for the same query', async () => {
  const forAda = await run<MyOrders>(myOrders, ada)
  const forGrace = await run<MyOrders>(myOrders, grace)
  expect(forAda.data?.me?.orders.map((order) => order.id)).toEqual(['o-1', 'o-3'])
  expect(forGrace.data?.me?.orders.map((order) => order.id)).toEqual(['o-2', 'o-4'])
})

it('shows all orders to the support team', async () => {
  const result = await run<MyOrders>(myOrders, linus)
  expect(result.data?.me?.orders).toHaveLength(4)
})

it('no longer has a field that takes a customer id', async () => {
  const result = await execute(
    'query Foreign { orders(customerId: "c-2") { id } }',
    {},
    { 'x-viewer-id': 'c-1' },
  )
  expect(result.status).toBe(400)
  expect(result.errors?.[0].extensions?.code).toBe('GRAPHQL_VALIDATION_FAILED')
})

it('tells the client per order whether the viewer can cancel it', async () => {
  const result = await run<MyOrders>(myOrders, ada)
  expect(result.data?.me?.orders).toEqual([
    { id: 'o-1', viewerCanCancel: true }, // PLACED
    { id: 'o-3', viewerCanCancel: false }, // SHIPPED
  ])
})

it('refuses to cancel a foreign order, tested with executeOperation', async () => {
  const result = await run<Cancel>(cancel('o-4'), ada)
  expect(result.data?.cancelOrder.__typename).toBe('OrderNotCancellable')
  expect((await db.orders.findById('o-4'))?.status).toBe('DRAFT')
})

it('lets Ada cancel her own PLACED order', async () => {
  const result = await run<Cancel>(cancel('o-1'), ada)
  expect(result.data?.cancelOrder.order).toEqual({ status: 'CANCELLED', viewerCanCancel: false })
})

it('lets the support team cancel an order of Grace', async () => {
  const result = await run<Cancel>(cancel('o-4'), linus)
  expect(result.data?.cancelOrder.order?.status).toBe('CANCELLED')
})

it('answers UNAUTHENTICATED when nobody is signed in', async () => {
  const result = await run<Cancel>(cancel('o-1'), null)
  expect(result.errors?.[0].extensions?.code).toBe('UNAUTHENTICATED')
})

it('decides in a pure function, without GraphQL', () => {
  const order = { id: 'o-9', customerId: 'c-1', status: 'PAID' as const, items: [] }
  expect(canCancel(ada, order)).toBe(false)
  expect(canCancel(ada, { ...order, status: 'DRAFT' })).toBe(true)
  expect(canCancel(grace, { ...order, status: 'DRAFT' })).toBe(false)
})
