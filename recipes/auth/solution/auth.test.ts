import { describe, expect, it } from 'vitest'
import { createTestClient } from '../src/test-client.ts'
import { yoga } from './yoga.ts'

const execute = createTestClient(yoga)
const as = (token: string) => ({ authorization: `Bearer ${token}` })
type OrdersData = { orders: { id: string; customer: { name: string; email: string | null } }[] }
const ordersWithEmail = `query { orders { id customer { name email } } }`

describe('authentication', () => {
  it('without a token, orders answers UNAUTHENTICATED', async () => {
    const result = await execute(ordersWithEmail)
    expect(result.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
  })

  it('an unknown token is treated like no token', async () => {
    const result = await execute(ordersWithEmail, {}, as('forged'))
    expect(result.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
  })
})

describe('authorization', () => {
  it('a customer sees only their own orders', async () => {
    const result = await execute<OrdersData>(ordersWithEmail, {}, as('token-ada'))
    expect(result.data?.orders.map((order) => order.id)).toEqual(['o-1', 'o-3'])
  })

  it('Customer.email is null for a customer, also on the nested path order → customer', async () => {
    const result = await execute<{ order: { customer: { email: string | null } } | null }>(
      `query { order(id: "o-1") { customer { email } } }`,
      {},
      as('token-ada'),
    )
    expect(result.errors).toBeUndefined()
    expect(result.data?.order?.customer.email).toBeNull()
  })

  it('SUPPORT sees all orders with email addresses', async () => {
    const result = await execute<OrdersData>(ordersWithEmail, {}, as('token-support'))
    expect(result.data?.orders.map((order) => order.customer.email)).toEqual([
      'ada@example.com',
      'grace@example.com',
      'ada@example.com',
    ])
  })

  it('a foreign order looks exactly like a missing one', async () => {
    const foreign = await execute(`query { order(id: "o-2") { id } }`, {}, as('token-ada'))
    const missing = await execute(`query { order(id: "o-404") { id } }`, {}, as('token-ada'))
    expect(foreign).toEqual(missing)
    expect(foreign.data).toEqual({ order: null })
  })

  it('customers is SUPPORT only: FORBIDDEN for a customer', async () => {
    const forbidden = await execute(`query { customers { id } }`, {}, as('token-ada'))
    expect(forbidden.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
    const allowed = await execute<{ customers: { email: string }[] }>(
      `query { customers { email } }`,
      {},
      as('token-support'),
    )
    expect(allowed.data?.customers).toHaveLength(2)
  })
})
