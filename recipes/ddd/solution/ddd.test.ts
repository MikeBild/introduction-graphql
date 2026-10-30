import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { resetOrders } from './orders/repository.ts'
import { startTestServer } from '../src/test-client.ts'
import { createApp } from './app.ts'

const { execute, close } = await startTestServer(await createApp())
afterAll(close)
beforeEach(() => resetOrders())

const cancelOrder = /* GraphQL */ `
  mutation CancelOrder($input: CancelOrderInput!) {
    cancelOrder(input: $input) {
      __typename
      ... on CancelOrderSuccess {
        order {
          id
          status
        }
      }
      ... on OrderNotCancellable {
        message
      }
    }
  }
`

const removeOrderItem = /* GraphQL */ `
  mutation RemoveOrderItem($input: RemoveOrderItemInput!) {
    removeOrderItem(input: $input) {
      __typename
      ... on RemoveOrderItemSuccess {
        order {
          id
          totalCents
          items {
            productId
          }
        }
      }
    }
  }
`

type CancelData = {
  cancelOrder: { __typename: string; order?: { id: string; status: string }; message?: string }
}
type RemoveData = {
  removeOrderItem: {
    __typename: string
    order?: { id: string; totalCents: number; items: { productId: string }[] }
  }
}

describe('mutations follow the aggregate', () => {
  it('cancels a placed order and returns it in CancelOrderSuccess', async () => {
    const result = await execute<CancelData>(cancelOrder, { input: { orderId: 'o-1' } })
    expect(result.data?.cancelOrder).toEqual({
      __typename: 'CancelOrderSuccess',
      order: { id: 'o-1', status: 'CANCELLED' },
    })
  })

  it('rejects cancelling a shipped order with OrderNotCancellable', async () => {
    const result = await execute<CancelData>(cancelOrder, { input: { orderId: 'o-4' } })
    expect(result.data?.cancelOrder.__typename).toBe('OrderNotCancellable')
    expect(result.errors).toBeUndefined()

    const after = await execute<{ order: { status: string } }>(
      'query Status { order(id: "o-4") { status } }',
    )
    expect(after.data?.order.status).toBe('SHIPPED')
  })

  it('names an order that does not exist', async () => {
    const result = await execute<CancelData>(cancelOrder, { input: { orderId: 'o-9' } })
    expect(result.data?.cancelOrder.__typename).toBe('OrderNotFound')
  })

  it('removes an item from a draft order and returns the order', async () => {
    const result = await execute<RemoveData>(removeOrderItem, {
      input: { orderId: 'o-3', productId: 'p-3' },
    })
    expect(result.data?.removeOrderItem).toEqual({
      __typename: 'RemoveOrderItemSuccess',
      order: { id: 'o-3', totalCents: 1290, items: [{ productId: 'p-1' }] },
    })
  })

  it('rejects removing an item from a placed order with OrderNotEditable', async () => {
    const result = await execute<RemoveData>(removeOrderItem, {
      input: { orderId: 'o-1', productId: 'p-1' },
    })
    expect(result.data?.removeOrderItem.__typename).toBe('OrderNotEditable')
  })

  it('has no updateOrder any more', async () => {
    const result = await execute(/* GraphQL */ `
      mutation UpdateOrder {
        updateOrder(input: { orderId: "o-4", status: CANCELLED }) {
          __typename
        }
      }
    `)
    expect(result.status).toBe(400)
  })
})

describe('one graph, two bounded contexts', () => {
  it('adds Customer.shippingAddress and Order.shipment from the shipping module', async () => {
    const result = await execute<{
      order: {
        shipment: { trackingNumber: string }
        customer: { name: string; shippingAddress: { recipient: string } }
      }
    }>(/* GraphQL */ `
      query ShippedOrder {
        order(id: "o-4") {
          shipment {
            trackingNumber
          }
          customer {
            name
            shippingAddress {
              recipient
            }
          }
        }
      }
    `)
    expect(result.data?.order).toEqual({
      shipment: { trackingNumber: 'DE-1001' },
      customer: {
        name: 'Grace Hopper',
        shippingAddress: { recipient: 'Hopper GmbH, Wareneingang' },
      },
    })
  })

  it('resolves Shipment.order through the loader', async () => {
    const result = await execute<{ shipments: { order: { status: string } }[] }>(/* GraphQL */ `
      query Shipments {
        shipments {
          order {
            status
          }
        }
      }
    `)
    expect(result.data?.shipments).toEqual([{ order: { status: 'SHIPPED' } }])
  })

  it.each([
    ['shipping', 'orders'],
    ['orders', 'shipping'],
  ])('keeps %s free of imports from %s', (module, other) => {
    const folder = new URL(`./${module}/`, import.meta.url).pathname
    const files = readdirSync(folder, { recursive: true, encoding: 'utf8' })
    const crossing = files
      .filter((file) => file.endsWith('.ts'))
      .filter((file) => readFileSync(join(folder, file), 'utf8').includes(`/${other}/`))
    expect(crossing).toEqual([])
  })
})
