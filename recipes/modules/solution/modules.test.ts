import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { afterAll, beforeEach, expect, it } from 'vitest'
import { db } from '../src/db.ts'
import { startTestServer } from '../src/test-client.ts'
import { createApp, createServer } from './app.ts'
import { createLoaders, type Context } from './context.ts'

const { execute, close } = await startTestServer(await createApp())
afterAll(close)
beforeEach(() => db.reset())

const changeFields = /* GraphQL */ `
  fragment ChangeFields on ChangeOrderItemsResult {
    __typename
    ... on ChangeOrderItemsSuccess {
      order {
        items {
          quantity
        }
        totalCents
      }
    }
    ... on OrderNotEditable {
      status
    }
    ... on OrderNotFound {
      orderId
    }
  }
`
const removeOrderItem = /* GraphQL */ `
  mutation RemoveOrderItem($input: RemoveOrderItemInput!) {
    removeOrderItem(input: $input) {
      ...ChangeFields
    }
  }
  ${changeFields}
`
const changeQuantity = /* GraphQL */ `
  mutation ChangeQuantity($input: ChangeOrderItemQuantityInput!) {
    changeOrderItemQuantity(input: $input) {
      ...ChangeFields
    }
  }
  ${changeFields}
`

type RemoveData = { removeOrderItem: Record<string, unknown> & { __typename: string } }

it('keeps a PLACED order unchanged and answers OrderNotEditable', async () => {
  const result = await execute<RemoveData>(
    removeOrderItem,
    { input: { orderId: 'o-1', productId: 'p-1' } },
    { 'x-customer-id': 'c-1' },
  )
  expect(result.data?.removeOrderItem).toEqual({ __typename: 'OrderNotEditable', status: 'PLACED' })
  expect((await db.orders.findById('o-1'))?.items).toHaveLength(1)
})

it('rejects a foreign order with OrderNotFound', async () => {
  const result = await execute<RemoveData>(
    removeOrderItem,
    { input: { orderId: 'o-2', productId: 'p-2' } },
    { 'x-customer-id': 'c-1' },
  )
  expect(result.data?.removeOrderItem).toEqual({ __typename: 'OrderNotFound', orderId: 'o-2' })
})

it('answers UNAUTHENTICATED without an identity', async () => {
  const result = await execute(removeOrderItem, { input: { orderId: 'o-3', productId: 'p-1' } })
  expect(result.errors?.[0].extensions?.code).toBe('UNAUTHENTICATED')
})

it('rejects quantity 0 with BAD_USER_INPUT before the logic runs', async () => {
  const result = await execute(
    changeQuantity,
    { input: { orderId: 'o-3', productId: 'p-1', quantity: 0 } },
    { 'x-customer-id': 'c-1' },
  )
  expect(result.errors?.[0].extensions?.code).toBe('BAD_USER_INPUT')
})

it('imports downward only: resolvers, logic, repository', () => {
  const importsOf = (file: string) => {
    const source = readFileSync(new URL(`./modules/orders/${file}`, import.meta.url), 'utf8')
    return [...source.matchAll(/^import (?!type )[^']*from '(.+)'$/gm)].map((match) => match[1])
  }

  expect(importsOf('resolvers.ts')).toEqual(['graphql', 'zod', './logic.ts'])
  expect(importsOf('logic.ts')).toEqual(['./repository.ts'])
  expect(importsOf('repository.ts')).toEqual(['../../../src/db.ts'])
})

it('serves one schema from the modules orders and products', async () => {
  const contextValue: Context = { viewer: { id: 'c-1' }, loaders: createLoaders() }
  const response = await createServer().executeOperation<{
    products: { inStock: boolean }[]
    orders: { totalCents: number; items: { product: { name: string } | null }[] }[]
  }>(
    {
      query: /* GraphQL */ `
        query Shop {
          products {
            inStock
          }
          orders {
            totalCents
            items {
              product {
                name
              }
            }
          }
        }
      `,
    },
    { contextValue },
  )
  assert(response.body.kind === 'single')
  expect(response.body.singleResult.errors).toBeUndefined()
  const data = response.body.singleResult.data
  expect(data?.products.map((product) => product.inStock)).toEqual([true, true, false])
  expect(data?.orders[0].totalCents).toBe(2580)
  expect(data?.orders[1].items[1].product?.name).toBe('Workbench')
})
