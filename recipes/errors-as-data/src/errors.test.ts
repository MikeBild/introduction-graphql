import { afterAll, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { startTestServer } from './test-client.ts'

const { execute, close } = await startTestServer(await createApp())
afterAll(close)

const placeOrder = /* GraphQL */ `
  mutation PlaceOrder($input: PlaceOrderInput!) {
    placeOrder(input: $input) {
      id
    }
  }
`
const keyboard = [{ productId: 'p-1', quantity: 1 }]

it('a GraphQLError with extensions.code reaches the client', async () => {
  const result = await execute(placeOrder, { input: { items: keyboard } })
  expect(result.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
})

it('a plain Error becomes INTERNAL_SERVER_ERROR – "out of stock" looks like a crash', async () => {
  const result = await execute(
    placeOrder,
    { input: { items: [{ productId: 'p-2', quantity: 1 }] } },
    { authorization: 'c-1' },
  )
  expect(result.data).toBeNull()
  expect(result.errors?.[0]?.extensions?.code).toBe('INTERNAL_SERVER_ERROR')
  // Apollo Server passes the internal message on: the client could only parse the text.
  expect(result.errors?.[0]?.message).toBe('Product p-2 is out of stock')
})

it('a failing nullable field costs only that field (partial data)', async () => {
  await execute(placeOrder, { input: { items: keyboard } }, { authorization: 'c-404' })
  const result = await execute<{ orders: { id: string; customer: { name: string } | null }[] }>(
    `query Orders { orders { id customer { name } } }`,
  )
  expect(result.data?.orders[0]).toEqual({ id: 'o-1', customer: { name: 'Ada Lovelace' } })
  expect(result.data?.orders[1]?.customer).toBeNull()
  expect(result.errors?.[0]?.path).toEqual(['orders', 1, 'customer'])
})
