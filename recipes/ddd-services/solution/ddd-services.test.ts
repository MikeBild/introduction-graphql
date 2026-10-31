import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { startService, startTestServer } from '../src/test-client.ts'
import { createApp } from './app.ts'
import { createShippingApp } from './shipping-service/app.ts'

// Only the setup changed: the service runs on a free port, the graph gets its URL.
const shipping = await startService(createShippingApp())
const { execute, close } = await startTestServer(await createApp({ shippingUrl: shipping.url }))
afterAll(async () => {
  await close()
  await shipping.close()
})

const getJson = async (path: string) => (await fetch(`${shipping.url}${path}`)).json()

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

describe('the shipping service', () => {
  const shipment = { id: 's-1', orderId: 'o-4', trackingNumber: 'DE-1001' }

  it('lists shipments and answers a batch by orderIds', async () => {
    expect(await getJson('/shipments')).toEqual([shipment])
    expect(await getJson('/shipments?orderIds=o-4,o-9')).toEqual([shipment])
    expect(await getJson('/shipments?orderIds=o-9')).toEqual([])
  })

  it('answers a batch of addresses by customerIds', async () => {
    expect(await getJson('/addresses?customerIds=c-2,c-9')).toEqual([
      {
        customerId: 'c-2',
        recipient: 'Hopper GmbH, Wareneingang',
        street: 'Hafenstraße 7',
        city: 'Bremen',
      },
    ])
  })
})

describe('the module became a service', () => {
  it('answers null for Order.shipment and keeps the order when the service is down', async () => {
    const lonely = await startTestServer(await createApp({ shippingUrl: 'http://127.0.0.1:1' }))
    try {
      const result = await lonely.execute<{ order: { status: string; shipment: unknown } }>(
        /* GraphQL */ `
          query ShippedOrder {
            order(id: "o-4") {
              status
              shipment {
                id
              }
            }
          }
        `,
      )
      expect(result.data?.order).toEqual({ status: 'SHIPPED', shipment: null })
      expect(result.errors?.map((error) => error.path)).toEqual([['order', 'shipment']])
    } finally {
      await lonely.close()
    }
  })

  it('keeps the shipping module in the graph free of imports from shipping-service', () => {
    const folder = new URL('./shipping/', import.meta.url).pathname
    const crossing = readdirSync(folder, { recursive: true, encoding: 'utf8' })
      .filter((file) => file.endsWith('.ts'))
      .filter((file) => readFileSync(join(folder, file), 'utf8').includes('shipping-service'))
    expect(crossing).toEqual([])
  })
})
