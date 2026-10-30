import { readFileSync } from 'node:fs'
import { afterAll, beforeEach, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { resetOrders } from './orders/repository.ts'
import { startTestServer } from './test-client.ts'

const { execute, close } = await startTestServer(await createApp())
afterAll(close)
beforeEach(() => resetOrders())

const updateOrder = /* GraphQL */ `
  mutation UpdateOrder($input: UpdateOrderInput!) {
    updateOrder(input: $input) {
      ... on UpdateOrderPayload {
        order {
          status
          items {
            quantity
          }
        }
      }
    }
  }
`

type UpdateOrderData = {
  updateOrder: { order: { status: string; items: { quantity: number }[] } }
}

it('cancels a shipped order: updateOrder never checks the status sequence', async () => {
  const result = await execute<UpdateOrderData>(updateOrder, {
    input: { orderId: 'o-4', status: 'CANCELLED' },
  })
  expect(result.data?.updateOrder.order.status).toBe('CANCELLED')
})

it('changes the items of a paid order: updateOrder never asks the aggregate', async () => {
  const result = await execute<UpdateOrderData>(updateOrder, {
    input: { orderId: 'o-2', items: [] },
  })
  expect(result.data?.updateOrder.order.items).toEqual([])
})

it('does not know shippingAddress: the shipping module is not connected', async () => {
  const result = await execute(/* GraphQL */ `
    query ShippingAddress {
      order(id: "o-1") {
        customer {
          shippingAddress {
            city
          }
        }
      }
    }
  `)
  expect(result.status).toBe(400)
})

it('reaches into the orders module: shipping imports its repository', () => {
  const source = readFileSync(new URL('./shipping/resolvers.ts', import.meta.url), 'utf8')
  expect(source).toContain('../orders/repository.ts')
})

// Your turn, see the exercise in README.md.
it.todo('cancels a placed order and returns it in CancelOrderSuccess')
it.todo('rejects cancelling a shipped order with OrderNotCancellable')
it.todo('removes an item from a draft order and returns the order')
it.todo('rejects removing an item from a placed order with OrderNotEditable')
it.todo('has no updateOrder any more')
it.todo('adds Customer.shippingAddress and Order.shipment from the shipping module')
it.todo('resolves Shipment.order through the loader')
it.todo('keeps both modules free of imports across the boundary')
