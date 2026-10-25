import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { load } from './schema.ts'
import { createTestClient } from './test-client.ts'
import { yoga } from './yoga.ts'

const execute = createTestClient(yoga)
beforeEach(() => {
  load.resolvedOrders = 0
})

test('a harmless looking nested query produces thousands of orders', async () => {
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
  assert.equal(result.errors, undefined)
  assert.equal(load.resolvedOrders, 100 + 100 * 10 + 100 * 10 * 10)
})

test('aliases multiply the same field without any limit', async () => {
  const aliases = Array.from(
    { length: 50 },
    (_, index) => `a${index}: orders(first: 100) { id }`,
  ).join('\n')
  const result = await execute(`query Aliases { ${aliases} }`)
  assert.equal(result.errors, undefined)
  assert.equal(load.resolvedOrders, 50 * 100)
})

test('any ad-hoc query is accepted', async () => {
  const result = await execute(`{ orders(first: 1) { id } }`)
  assert.deepEqual(result.data, { orders: [{ id: 'o-0' }] })
})
