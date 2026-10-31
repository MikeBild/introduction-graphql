import { readFileSync } from 'node:fs'
import { afterAll, describe, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { startTestServer } from './test-client.ts'

const { execute, close } = await startTestServer(await createApp())
afterAll(close)

// These tests stay as they are: the clients of the graph never notice the service behind it.
describe('the graph for its clients', () => {
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

  it('answers null for an order that has not left the warehouse', async () => {
    const result = await execute<{ openOrders: { id: string; shipment: unknown }[] }>(
      /* GraphQL */ `
        query OpenOrders {
          openOrders {
            id
            shipment {
              id
            }
          }
        }
      `,
    )
    expect(result.data?.openOrders).toEqual([
      { id: 'o-1', shipment: null },
      { id: 'o-3', shipment: null },
      { id: 'o-5', shipment: null },
    ])
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
})

describe('the shipping module today', () => {
  it('reads the shipping repository in-process: the loader crosses the boundary', () => {
    const source = readFileSync(new URL('./shipping/loaders.ts', import.meta.url), 'utf8')
    expect(source).toContain('../shipping-service/repository.ts')
  })
})

// Your turn, see the exercise in README.md.
it.todo('the shipping service lists shipments and answers a batch by orderIds')
it.todo('the shipping service answers a batch of addresses by customerIds')
it.todo('answers null for Order.shipment and keeps the order when the service is down')
it.todo('keeps the shipping module in the graph free of imports from shipping-service')
