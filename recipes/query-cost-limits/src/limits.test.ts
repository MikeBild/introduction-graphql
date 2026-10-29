import { afterAll, beforeEach, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { load } from './schema.ts'
import { startTestServer } from './test-client.ts'

const { execute, close } = await startTestServer(await createApp())
afterAll(close)
beforeEach(() => {
  load.resolvedOrders = 0
})

it('a harmless looking nested query produces thousands of orders', async () => {
  const result = await execute(/* GraphQL */ `
    query Explode {
      orders(first: 100) {
        customer {
          orders(first: 100) {
            customer {
              orders(first: 100) {
                id
              }
            }
          }
        }
      }
    }
  `)
  expect(result.errors).toBeUndefined()
  expect(load.resolvedOrders).toBe(100 + 100 * 10 + 100 * 10 * 10)
})

it('aliases multiply the same field without any limit', async () => {
  const aliases = Array.from(
    { length: 50 },
    (_, index) => `a${index}: orders(first: 100) { id }`,
  ).join('\n')
  const result = await execute(`query Aliases { ${aliases} }`)
  expect(result.errors).toBeUndefined()
  expect(load.resolvedOrders).toBe(50 * 100)
})

it('any ad-hoc query is accepted', async () => {
  const result = await execute(`{ orders(first: 1) { id } }`)
  expect(result.data).toEqual({ orders: [{ id: 'o-0' }] })
})
