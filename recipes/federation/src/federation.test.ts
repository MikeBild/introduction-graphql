import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { parse } from 'graphql'
import { createCustomersSubgraph, customersTypeDefs } from './customers-subgraph.ts'
import { createOrdersSubgraph, ordersTypeDefs } from './orders-subgraph.ts'
import { composeSupergraph, createGateway, listen } from './supergraph.ts'
import { createTestClient } from './test-client.ts'

const customers = await listen(createCustomersSubgraph())
const orders = await listen(createOrdersSubgraph())
const subgraphs = [
  { name: 'customers', typeDefs: customersTypeDefs, url: customers.url },
  { name: 'orders', typeDefs: ordersTypeDefs, url: orders.url },
]
const gateway = createGateway(composeSupergraph(subgraphs))
after(async () => {
  await gateway.dispose()
  customers.close()
  orders.close()
})

test('the gateway joins orders and customers via the Customer entity', async () => {
  const result = await createTestClient(gateway)<{
    orders: { id: string; customer: { name: string } }[]
  }>(`query OrdersWithCustomer { orders { id status customer { name } } }`)
  assert.equal(result.errors, undefined)
  assert.deepEqual(result.data?.orders[0], {
    id: 'o-1',
    status: 'OPEN',
    customer: { name: 'Ada Lovelace' },
  })
})

test('composition fails when two subgraphs disagree about a shared type', () => {
  const conflicting = parse(/* GraphQL */ `
    extend schema @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key"])
    type Customer @key(fields: "id", resolvable: false) {
      id: Int!
    }
    type Query {
      ping: String
    }
  `)
  assert.throws(
    () =>
      composeSupergraph([
        ...subgraphs,
        { name: 'billing', typeDefs: conflicting, url: 'http://billing/graphql' },
      ]),
    /Composition failed/,
  )
})
