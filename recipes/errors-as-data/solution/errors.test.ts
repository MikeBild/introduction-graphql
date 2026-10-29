import { afterAll, expect, it } from 'vitest'
import { startTestServer } from '../src/test-client.ts'
import { createApp } from './app.ts'

const { execute, close } = await startTestServer(await createApp())
afterAll(close)
const asCustomer = { authorization: 'c-1' }

type PlaceOrderData = {
  placeOrder:
    | { __typename: 'PlaceOrderSuccess'; order: { id: string } }
    | { __typename: 'OutOfStock'; productId: string; message: string }
    | { __typename: 'EmptyOrder'; message: string }
}

const placeOrder = /* GraphQL */ `
  mutation PlaceOrder($input: PlaceOrderInput!) {
    placeOrder(input: $input) {
      __typename
      ... on PlaceOrderSuccess {
        order {
          id
        }
      }
      ... on OutOfStock {
        productId
        message
      }
      ... on EmptyOrder {
        message
      }
    }
  }
`

it('out of stock is a typed result, not an error', async () => {
  const result = await execute<PlaceOrderData>(
    placeOrder,
    { input: { items: [{ productId: 'p-2', quantity: 1 }] } },
    asCustomer,
  )
  expect(result.errors).toBeUndefined()
  expect(result.data?.placeOrder).toEqual({
    __typename: 'OutOfStock',
    productId: 'p-2',
    message: 'Not enough items in stock.',
  })
})

it('an order without items is a typed result, too', async () => {
  const result = await execute<PlaceOrderData>(placeOrder, { input: { items: [] } }, asCustomer)
  expect(result.errors).toBeUndefined()
  expect(result.data?.placeOrder).toEqual({
    __typename: 'EmptyOrder',
    message: 'An order needs at least one item.',
  })
})

it('success returns the order', async () => {
  const result = await execute<PlaceOrderData>(
    placeOrder,
    { input: { items: [{ productId: 'p-1', quantity: 2 }] } },
    asCustomer,
  )
  expect(result.data?.placeOrder).toEqual({
    __typename: 'PlaceOrderSuccess',
    order: { id: 'o-2' },
  })
})

it('technical and cross-cutting errors stay in the errors field', async () => {
  const result = await execute<PlaceOrderData>(placeOrder, {
    input: { items: [{ productId: 'p-1', quantity: 1 }] },
  })
  expect(result.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
})

it('formatError masks internal messages, but keeps code and path', async () => {
  await execute(
    placeOrder,
    { input: { items: [{ productId: 'p-1', quantity: 1 }] } },
    { authorization: 'c-404' },
  )
  const result = await execute(`query Orders { orders { id customer { name } } }`)
  expect(result.errors?.[0]).toMatchObject({
    message: 'Internal server error',
    path: ['orders', 2, 'customer'],
    extensions: { code: 'INTERNAL_SERVER_ERROR' },
  })
})
