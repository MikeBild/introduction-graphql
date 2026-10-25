import assert from 'node:assert/strict'
import { test } from 'node:test'
import { orders } from '../src/data.ts'
import { restHandler } from '../src/rest.ts'
import { createTestClient } from '../src/test-client.ts'
import { yoga } from './yoga.ts'

const execute = createTestClient(yoga)

type OverviewData = {
  orders: {
    id: string
    customer: { name: string }
    items: { quantity: number; product: { title: string } }[]
  }[]
}

const overviewQuery = /* GraphQL */ `
  query OpenOrderOverview {
    orders(status: OPEN) {
      id
      customer {
        name
      }
      items {
        quantity
        product {
          title
        }
      }
    }
  }
`

test('GraphQL: the whole overview in one request', async () => {
  const result = await execute<OverviewData>(overviewQuery)
  assert.equal(result.errors, undefined)
  assert.deepEqual(result.data?.orders[0], {
    id: 'o-1',
    customer: { name: 'Ada Lovelace' },
    items: [
      { quantity: 1, product: { title: 'Keyboard' } },
      { quantity: 2, product: { title: 'Mouse' } },
    ],
  })
})

test('GraphQL answer is smaller than the sum of the REST answers', async () => {
  const graphqlBytes = JSON.stringify(await execute(overviewQuery)).length
  const openOrders = orders.filter((order) => order.status === 'OPEN')
  const restPaths = [
    '/orders?status=OPEN',
    ...openOrders.map((order) => `/customers/${order.customerId}`),
    '/products?ids=p-1,p-2',
  ]
  const restBodies = await Promise.all(
    restPaths.map(async (path) =>
      (await restHandler(new Request(`http://localhost${path}`))).text(),
    ),
  )
  const restBytes = restBodies.reduce((sum, body) => sum + body.length, 0)
  assert.ok(graphqlBytes < restBytes, `GraphQL ${graphqlBytes} bytes vs REST ${restBytes} bytes`)
})
