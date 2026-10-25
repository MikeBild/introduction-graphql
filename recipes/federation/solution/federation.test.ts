import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createCustomersSubgraph, customersTypeDefs } from '../src/customers-subgraph.ts'
import { composeSupergraph, createGateway, listen } from '../src/supergraph.ts'
import { createTestClient } from '../src/test-client.ts'
import { createOrdersSubgraph, ordersTypeDefs } from './orders-subgraph.ts'

const customers = await listen(createCustomersSubgraph())
const orders = await listen(createOrdersSubgraph())
const supergraphSdl = composeSupergraph([
  { name: 'customers', typeDefs: customersTypeDefs, url: customers.url },
  { name: 'orders', typeDefs: ordersTypeDefs, url: orders.url },
])
const gateway = createGateway(supergraphSdl)
after(async () => {
  await gateway.dispose()
  customers.close()
  orders.close()
})

test('Customer.orders comes from the orders subgraph, name from the customers subgraph', async () => {
  const result = await createTestClient(gateway)<{
    customers: { name: string; orders: { id: string }[] }[]
  }>(`query CustomersWithOrders { customers { name orders { id status } } }`)
  assert.equal(result.errors, undefined)
  assert.deepEqual(result.data?.customers, [
    { name: 'Ada Lovelace', orders: [{ id: 'o-1', status: 'OPEN' }] },
    {
      name: 'Alan Turing',
      orders: [
        { id: 'o-2', status: 'PAID' },
        { id: 'o-3', status: 'OPEN' },
      ],
    },
  ])
})

test('the supergraph records which subgraph resolves which field', () => {
  assert.match(supergraphSdl, /orders: \[Order!\]! @join__field\(graph: ORDERS\)/)
})
