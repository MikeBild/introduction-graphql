import { afterAll, expect, it } from 'vitest'
import { parse } from 'graphql'
import { createCustomersSubgraph, customersTypeDefs } from './customers-subgraph.ts'
import { createOrdersSubgraph, ordersTypeDefs } from './orders-subgraph.ts'
import { composeSupergraph, createGateway, listen } from './supergraph.ts'
import { createTestClient } from './test-client.ts'

const customers = await listen(await createCustomersSubgraph())
const orders = await listen(await createOrdersSubgraph())
const subgraphs = [
  { name: 'customers', typeDefs: customersTypeDefs, url: customers.url },
  { name: 'orders', typeDefs: ordersTypeDefs, url: orders.url },
]
const gateway = await createGateway(composeSupergraph(subgraphs))
const gatewayServer = await listen(gateway.app)
const execute = createTestClient(gatewayServer.url)
afterAll(async () => {
  await gateway.stop()
  gatewayServer.close()
  customers.close()
  orders.close()
})

it('the gateway joins orders and customers via the Customer entity', async () => {
  const result = await execute<{
    orders: { id: string; customer: { name: string } }[]
  }>(`query OrdersWithCustomer { orders { id status customer { name } } }`)
  expect(result.errors).toBeUndefined()
  expect(result.data?.orders[0]).toEqual({
    id: 'o-1',
    status: 'OPEN',
    customer: { name: 'Ada Lovelace' },
  })
})

it('composition fails when two subgraphs disagree about a shared type', () => {
  const conflicting = parse(/* GraphQL */ `
    extend schema @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key"])
    type Customer @key(fields: "id", resolvable: false) {
      id: Int!
    }
    type Query {
      ping: String
    }
  `)
  expect(() =>
    composeSupergraph([
      ...subgraphs,
      { name: 'billing', typeDefs: conflicting, url: 'http://billing/graphql' },
    ]),
  ).toThrow(/Composition failed/)
})
