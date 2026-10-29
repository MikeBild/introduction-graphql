import { afterAll, expect, it } from 'vitest'
import { createApp } from './app.ts'
import type { Customer, Order, Product } from './data.ts'
import { startTestServer } from './test-client.ts'

const { url, execute, close } = await startTestServer(await createApp())
afterAll(close)
const apiUrl = url.replace('/graphql', '/api')

// Counts requests and bytes like the network tab in the browser would.
const createRestClient = () => {
  const stats = { requests: 0, bytes: 0 }
  const get = async <T>(path: string): Promise<T> => {
    const body = await (await fetch(`${apiUrl}${path}`)).text()
    stats.requests += 1
    stats.bytes += body.length
    return JSON.parse(body) as T
  }
  return { get, stats }
}

it('REST: the open-orders view needs a request waterfall and overfetches', async () => {
  const { get, stats } = createRestClient()
  const openOrders = await get<Order[]>('/orders?status=PLACED')
  const customers = await Promise.all(
    openOrders.map((order) => get<Customer>(`/customers/${order.customerId}`)),
  )
  const productIds = [
    ...new Set(openOrders.flatMap((order) => order.items.map((item) => item.productId))),
  ]
  const products = await get<Product[]>(`/products?ids=${productIds.join(',')}`)

  expect(customers.length).toBe(2)
  expect(products.length).toBe(2)
  expect(stats.requests).toBe(4)
  expect('phone' in (customers[0] ?? {}), 'REST returns fields the view never shows').toBeTruthy()
})

it('REST: an unknown customer is a 404', async () => {
  const response = await fetch(`${apiUrl}/customers/c-404`)
  expect(response.status).toBe(404)
})

it('GraphQL: one request returns exactly the requested fields', async () => {
  const result = await execute<{ orders: { id: string; customer: { name: string } }[] }>(
    /* GraphQL */ `
      query OpenOrders {
        orders(status: PLACED) {
          id
          customer {
            name
          }
        }
      }
    `,
  )
  expect(result.data?.orders).toEqual([
    { id: 'o-1', customer: { name: 'Ada Lovelace' } },
    { id: 'o-3', customer: { name: 'Alan Turing' } },
  ])
})

it('GraphQL: OrderItem knows only the productId – the product name needs a second API', async () => {
  const result = await execute<{ orders: { items: { productId: string }[] }[] }>(
    `query { orders(status: PLACED) { items { productId quantity } } }`,
  )
  expect(result.data?.orders[0]?.items).toEqual([
    { productId: 'p-1', quantity: 1 },
    { productId: 'p-2', quantity: 2 },
  ])
})
