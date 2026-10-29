import { expect, it } from 'vitest'
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

it('a GraphQLError with extensions.code reaches the client', async () => {
  const result = await execute(placeOrder, {
    input: { productId: 'p-1', quantity: 1, street: 'Main St 1' },
  })
  expect(result.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
})

it('a plain Error is masked – the client cannot tell "out of stock" from a crash', async () => {
  const result = await execute(
    placeOrder,
    { input: { productId: 'p-2', quantity: 1, street: 'Main St 1' } },
    { authorization: 'c-1' },
  )
  expect(result.data).toBeNull()
  expect(result.errors?.[0]?.message).toBe('Unexpected error.')
  expect(result.errors?.[0]?.extensions?.code).toBe('INTERNAL_SERVER_ERROR')
})

it('a failing nullable field costs only that field (partial data)', async () => {
  await execute(
    placeOrder,
    { input: { productId: 'p-1', quantity: 1, street: 'Elm St 2' } },
    { authorization: 'c-404' },
  )
  const result = await execute<{ orders: { id: string; customer: { name: string } | null }[] }>(
    `query Orders { orders { id customer { name } } }`,
  )
  expect(result.data?.orders[0]).toEqual({ id: 'o-1', customer: { name: 'Ada Lovelace' } })
  expect(result.data?.orders[1]?.customer).toBeNull()
  expect(result.errors?.[0]?.path).toEqual(['orders', 1, 'customer'])
})
