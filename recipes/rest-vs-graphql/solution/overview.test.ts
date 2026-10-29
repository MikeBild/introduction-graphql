import { afterAll, expect, it } from 'vitest'
import { orders } from '../src/data.ts'
import { startTestServer } from '../src/test-client.ts'
import { createApp } from './app.ts'

const { url, execute, close } = await startTestServer(await createApp())
afterAll(close)
const apiUrl = url.replace('/graphql', '/api')

type OverviewData = {
  orders: {
    id: string
    totalCents: number
    customer: { name: string }
    items: { quantity: number; product: { name: string } }[]
  }[]
}

const overviewQuery = /* GraphQL */ `
  query OpenOrderOverview {
    orders(status: PLACED) {
      id
      totalCents
      customer {
        name
      }
      items {
        quantity
        product {
          name
        }
      }
    }
  }
`

it('GraphQL: the whole overview in one request', async () => {
  const result = await execute<OverviewData>(overviewQuery)
  expect(result.errors).toBeUndefined()
  expect(result.data?.orders[0]).toEqual({
    id: 'o-1',
    totalCents: 16700,
    customer: { name: 'Ada Lovelace' },
    items: [
      { quantity: 1, product: { name: 'Keyboard' } },
      { quantity: 2, product: { name: 'Mouse' } },
    ],
  })
})

it('GraphQL answer is smaller than the sum of the REST answers', async () => {
  const { status: _status, ...graphqlBody } = await execute(overviewQuery)
  const graphqlBytes = JSON.stringify(graphqlBody).length
  const openOrders = orders.filter((order) => order.status === 'PLACED')
  const restPaths = [
    '/orders?status=PLACED',
    ...openOrders.map((order) => `/customers/${order.customerId}`),
    '/products?ids=p-1,p-2',
  ]
  const restBodies = await Promise.all(
    restPaths.map(async (path) => (await fetch(`${apiUrl}${path}`)).text()),
  )
  const restBytes = restBodies.reduce((sum, body) => sum + body.length, 0)
  expect(
    graphqlBytes < restBytes,
    `GraphQL ${graphqlBytes} bytes vs REST ${restBytes} bytes`,
  ).toBeTruthy()
})
