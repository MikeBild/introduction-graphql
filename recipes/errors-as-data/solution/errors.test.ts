import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createTestClient } from '../src/test-client.ts'
import { yoga } from './yoga.ts'

const execute = createTestClient(yoga)
const asCustomer = { authorization: 'c-1' }

type PlaceOrderData = {
  placeOrder:
    | { __typename: 'PlaceOrderSuccess'; order: { id: string } }
    | { __typename: 'OutOfStock'; productId: string; message: string }
    | { __typename: 'InvalidAddress'; field: string; message: string }
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
      ... on InvalidAddress {
        field
        message
      }
    }
  }
`

test('out of stock is a typed result, not an error', async () => {
  const result = await execute<PlaceOrderData>(
    placeOrder,
    { input: { productId: 'p-2', quantity: 1, street: 'Main St 1' } },
    asCustomer,
  )
  assert.equal(result.errors, undefined)
  assert.deepEqual(result.data?.placeOrder, {
    __typename: 'OutOfStock',
    productId: 'p-2',
    message: 'Not enough items in stock.',
  })
})

test('an invalid address names the field', async () => {
  const result = await execute<PlaceOrderData>(
    placeOrder,
    { input: { productId: 'p-1', quantity: 1, street: ' ' } },
    asCustomer,
  )
  assert.deepEqual(result.data?.placeOrder, {
    __typename: 'InvalidAddress',
    field: 'street',
    message: 'Street must not be empty.',
  })
})

test('success returns the order', async () => {
  const result = await execute<PlaceOrderData>(
    placeOrder,
    { input: { productId: 'p-1', quantity: 2, street: 'Main St 1' } },
    asCustomer,
  )
  assert.deepEqual(result.data?.placeOrder, {
    __typename: 'PlaceOrderSuccess',
    order: { id: 'o-2' },
  })
})

test('technical and cross-cutting errors stay in the errors field', async () => {
  const result = await execute<PlaceOrderData>(placeOrder, {
    input: { productId: 'p-1', quantity: 1, street: 'Main St 1' },
  })
  assert.equal(result.errors?.[0]?.extensions?.code, 'UNAUTHENTICATED')
})
