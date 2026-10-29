import { readFile } from 'node:fs/promises'
import { expect, it } from 'vitest'
import { diffSchemas } from '../src/schema-diff.ts'
import { createTestClient } from '../src/test-client.ts'
import { deprecatedUsage } from './deprecated-usage.ts'
import { yoga } from './yoga.ts'

const productionSdl = await readFile(
  new URL('../schema/production.graphql', import.meta.url),
  'utf8',
)
const currentSdl = await readFile(new URL('./schema/current.graphql', import.meta.url), 'utf8')
const execute = createTestClient(yoga)

it('expand step: totalPrice added, total deprecated – nothing breaks', async () => {
  const result = await diffSchemas(productionSdl, currentSdl)
  expect(result.breaking).toEqual([])
  expect(
    result.safe.some((change) => change.message.includes("'totalPrice' was added")),
  ).toBeTruthy()
  expect(
    result.safe.some((change) => change.message.includes("'Order.total' is deprecated")),
  ).toBeTruthy()
})

it('a new required input field is breaking', async () => {
  const required = currentSdl.replace('note: String', 'note: String!')
  const result = await diffSchemas(productionSdl, required)
  expect(result.breaking.length).toBe(1)
  expect(result.breaking[0]?.message ?? '').toMatch(
    /Input field 'note' of type 'String!' was added/,
  )
})

it('a new enum value is dangerous for old clients', async () => {
  const withEnumValue = currentSdl.replace('  PAID\n', '  PAID\n  SHIPPED\n')
  const result = await diffSchemas(productionSdl, withEnumValue)
  expect(result.breaking.length).toBe(0)
  expect(
    result.dangerous.some((change) =>
      change.message.includes("'SHIPPED' was added to enum 'OrderStatus'"),
    ),
  ).toBeTruthy()
})

it('old and new clients both work, and the old one is identified', async () => {
  const oldClient = await execute(
    `query Orders { orders { id total } }`,
    {},
    { 'x-client-name': 'shop-ios', 'x-client-version': '3.1.0' },
  )
  const newClient = await execute(
    `query Orders { orders { id totalPrice { amount currency } } }`,
    {},
    { 'x-client-name': 'shop-web', 'x-client-version': '5.0.0' },
  )
  expect(oldClient.data).toEqual({
    orders: [
      { id: 'o-1', total: 167 },
      { id: 'o-2', total: 349 },
    ],
  })
  expect(newClient.data).toEqual({
    orders: [
      { id: 'o-1', totalPrice: { amount: '167.00', currency: 'EUR' } },
      { id: 'o-2', totalPrice: { amount: '349.00', currency: 'EUR' } },
    ],
  })
  expect([...deprecatedUsage.entries()]).toEqual([['shop-ios@3.1.0', new Set(['Order.total'])]])
})
