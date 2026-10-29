import { afterAll, expect, it } from 'vitest'
import { createCustomersSubgraph, customersTypeDefs } from '../src/customers-subgraph.ts'
import { composeSupergraph, createGateway, listen } from '../src/supergraph.ts'
import { createTestClient } from '../src/test-client.ts'
import { createOrdersSubgraph, ordersTypeDefs } from './orders-subgraph.ts'

const customers = await listen(await createCustomersSubgraph())
const orders = await listen(await createOrdersSubgraph())
const supergraphSdl = composeSupergraph([
  { name: 'customers', typeDefs: customersTypeDefs, url: customers.url },
  { name: 'orders', typeDefs: ordersTypeDefs, url: orders.url },
])
const gateway = await createGateway(supergraphSdl)
const gatewayServer = await listen(gateway.app)
const execute = createTestClient(gatewayServer.url)
afterAll(async () => {
  await gateway.stop()
  gatewayServer.close()
  customers.close()
  orders.close()
})

it('Customer.orders comes from the orders subgraph, name from the customers subgraph', async () => {
  const result = await execute<{
    customers: { name: string; orders: { id: string }[] }[]
  }>(`query CustomersWithOrders { customers { name orders { id status } } }`)
  expect(result.errors).toBeUndefined()
  expect(result.data?.customers).toEqual([
    { name: 'Ada Lovelace', orders: [{ id: 'o-1', status: 'PLACED' }] },
    {
      name: 'Alan Turing',
      orders: [
        { id: 'o-2', status: 'PAID' },
        { id: 'o-3', status: 'PLACED' },
      ],
    },
  ])
})

it('the supergraph records which subgraph resolves which field', () => {
  expect(supergraphSdl).toMatch(/orders: \[Order!\]! @join__field\(graph: ORDERS\)/)
})
