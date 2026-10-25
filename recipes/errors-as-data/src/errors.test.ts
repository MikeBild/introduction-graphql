import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createTestClient } from './test-client.ts'
import { yoga } from './yoga.ts'

const execute = createTestClient(yoga)
const placeOrder = /* GraphQL */ `
  mutation PlaceOrder($input: PlaceOrderInput!) {
    placeOrder(input: $input) {
      id
    }
  }
`

test('a GraphQLError with extensions.code reaches the client', async () => {
  const result = await execute(placeOrder, {
    input: { productId: 'p-1', quantity: 1, street: 'Main St 1' },
  })
  assert.equal(result.errors?.[0]?.extensions?.code, 'UNAUTHENTICATED')
})

test('a plain Error is masked – the client cannot tell "out of stock" from a crash', async () => {
  const result = await execute(
    placeOrder,
    { input: { productId: 'p-2', quantity: 1, street: 'Main St 1' } },
    { authorization: 'c-1' },
  )
  assert.equal(result.data, null)
  assert.equal(result.errors?.[0]?.message, 'Unexpected error.')
  assert.equal(result.errors?.[0]?.extensions?.code, 'INTERNAL_SERVER_ERROR')
})

test('a failing nullable field costs only that field (partial data)', async () => {
  await execute(
    placeOrder,
    { input: { productId: 'p-1', quantity: 1, street: 'Elm St 2' } },
    { authorization: 'c-404' },
  )
  const result = await execute<{ orders: { id: string; customer: { name: string } | null }[] }>(
    `query Orders { orders { id customer { name } } }`,
  )
  assert.deepEqual(result.data?.orders[0], { id: 'o-1', customer: { name: 'Ada Lovelace' } })
  assert.equal(result.data?.orders[1]?.customer, null)
  assert.deepEqual(result.errors?.[0]?.path, ['orders', 1, 'customer'])
})
