import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Customer, Order, Product } from './data.ts'
import { restHandler } from './rest.ts'
import { createTestClient } from './test-client.ts'
import { yoga } from './yoga.ts'

const execute = createTestClient(yoga)

// Counts requests and bytes like the network tab in the browser would.
const createRestClient = () => {
  const stats = { requests: 0, bytes: 0 }
  const get = async <T>(path: string): Promise<T> => {
    const body = await (await restHandler(new Request(`http://localhost${path}`))).text()
    stats.requests += 1
    stats.bytes += body.length
    return JSON.parse(body) as T
  }
  return { get, stats }
}

test('REST: the open-orders view needs a request waterfall and overfetches', async () => {
  const { get, stats } = createRestClient()
  const openOrders = await get<Order[]>('/orders?status=OPEN')
  const customers = await Promise.all(
    openOrders.map((order) => get<Customer>(`/customers/${order.customerId}`)),
  )
  const productIds = [
    ...new Set(openOrders.flatMap((order) => order.items.map((item) => item.productId))),
  ]
  const products = await get<Product[]>(`/products?ids=${productIds.join(',')}`)

  assert.equal(customers.length, 2)
  assert.equal(products.length, 2)
  assert.equal(stats.requests, 4)
  assert.ok('phone' in (customers[0] ?? {}), 'REST returns fields the view never shows')
})

test('GraphQL: one request returns exactly the requested fields', async () => {
  const result = await execute<{ orders: { id: string; customer: { name: string } }[] }>(
    /* GraphQL */ `
      query OpenOrders {
        orders(status: OPEN) {
          id
          customer {
            name
          }
        }
      }
    `,
  )
  assert.deepEqual(result.data?.orders, [
    { id: 'o-1', customer: { name: 'Ada Lovelace' } },
    { id: 'o-3', customer: { name: 'Alan Turing' } },
  ])
})
