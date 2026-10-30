import { afterAll, beforeEach, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { db } from './db.ts'
import { startTestServer } from './test-client.ts'

const { execute, close } = await startTestServer(await createApp())
afterAll(close)
beforeEach(() => db.reset())

const asAda = { 'x-viewer-id': 'c-1' }

it('shows Ada the orders of Grace: the id comes from the client', async () => {
  const result = await execute<{ orders: { id: string }[] }>(
    /* GraphQL */ `
      query Orders($customerId: ID!) {
        orders(customerId: $customerId) {
          id
        }
      }
    `,
    { customerId: 'c-2' },
    asAda,
  )
  expect(result.data?.orders.map((order) => order.id)).toEqual(['o-2', 'o-4'])
})

it('shows the orders of Grace to anybody, even without a sign-in', async () => {
  const result = await execute<{ orders: { id: string }[] }>(/* GraphQL */ `
    query Orders {
      orders(customerId: "c-2") {
        id
      }
    }
  `)
  expect(result.data?.orders).toHaveLength(2)
})

it('lets Ada cancel an order of Grace', async () => {
  const result = await execute<{ cancelOrder: { status: string } | null }>(
    /* GraphQL */ `
      mutation Cancel {
        cancelOrder(input: { orderId: "o-4" }) {
          status
        }
      }
    `,
    {},
    asAda,
  )
  expect(result.data?.cancelOrder?.status).toBe('CANCELLED')
})

// Your turn, see the exercise in README.md.
it.todo('answers me with null without a sign-in')
it.todo('gives Ada and Grace different orders for the same query')
it.todo('shows all orders to the support team')
it.todo('no longer has a field that takes a customer id')
it.todo('tells the client per order whether the viewer can cancel it')
it.todo('refuses to cancel a foreign order, tested with executeOperation')
