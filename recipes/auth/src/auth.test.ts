import { expect, it } from 'vitest'
import { verifyToken } from './data.ts'
import { createTestClient } from './test-client.ts'
import { yoga } from './yoga.ts'

const execute = createTestClient(yoga)

it('verifyToken maps a bearer token to a user, anything else to null', async () => {
  expect(await verifyToken('Bearer token-support')).toEqual({ id: 'u-1', role: 'SUPPORT' })
  expect(await verifyToken('Bearer unknown')).toBeNull()
  expect(await verifyToken(null)).toBeNull()
})

it('leaks: without any token the client sees all orders and email addresses', async () => {
  const result = await execute<{ orders: { id: string; customer: { email: string } }[] }>(
    `query { orders { id customer { email } } }`,
  )
  expect(result.errors).toBeUndefined()
  expect(result.data?.orders.map((order) => order.customer.email)).toEqual([
    'ada@example.com',
    'grace@example.com',
    'ada@example.com',
  ])
})
