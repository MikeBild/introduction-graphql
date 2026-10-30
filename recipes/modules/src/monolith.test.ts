import assert from 'node:assert'
import { ApolloServer } from '@apollo/server'
import { afterAll, beforeEach, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { db } from './db.ts'
import { startTestServer } from './test-client.ts'

const { execute, close } = await startTestServer(await createApp())
afterAll(close)
beforeEach(() => db.reset())

const removeOrderItem = /* GraphQL */ `
  mutation RemoveOrderItem($input: RemoveOrderItemInput!) {
    removeOrderItem(input: $input) {
      __typename
      ... on ChangeOrderItemsSuccess {
        order {
          items {
            quantity
          }
        }
      }
    }
  }
`

type Data = { removeOrderItem: { __typename: string; order?: { items: unknown[] } } }

it('removes an item from a PLACED order: the rule only lives in the other resolver', async () => {
  const result = await execute<Data>(
    removeOrderItem,
    { input: { orderId: 'o-1', productId: 'p-1' } },
    { 'x-customer-id': 'c-1' },
  )
  expect(result.data?.removeOrderItem.__typename).toBe('ChangeOrderItemsSuccess')
  expect(result.data?.removeOrderItem.order?.items).toEqual([])
})

it('lets a stranger change the order of another customer', async () => {
  const result = await execute<Data>(removeOrderItem, {
    input: { orderId: 'o-2', productId: 'p-2' },
  })
  expect(result.data?.removeOrderItem.__typename).toBe('ChangeOrderItemsSuccess')
})

it('lets the last module win without a word when Apollo Server merges an array', async () => {
  const orders = { Query: { catalog: () => 'from orders' } }
  const products = { Query: { catalog: () => 'from products' } }
  const server = new ApolloServer({
    typeDefs: ['type Query', 'extend type Query { catalog: String }'],
    resolvers: [orders, products],
  })
  const response = await server.executeOperation({ query: 'query Catalog { catalog }' })
  assert(response.body.kind === 'single')
  expect(response.body.singleResult.data).toEqual({ catalog: 'from products' })
})

// Your turn, see the exercise in README.md.
it.todo('keeps a PLACED order unchanged and answers OrderNotEditable')
it.todo('rejects a foreign order with OrderNotFound')
it.todo('tests the rule in orders/logic.ts without GraphQL')
it.todo('rejects quantity 0 with BAD_USER_INPUT before the logic runs')
it.todo('imports downward only: resolvers, logic, repository')
it.todo('throws when two modules define the same Query field')
it.todo('serves one schema from the modules orders and products')
