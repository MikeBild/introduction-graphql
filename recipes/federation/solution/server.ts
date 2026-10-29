import { createCustomersSubgraph, customersTypeDefs } from '../src/customers-subgraph.ts'
import { log } from '../src/logger.ts'
import { composeSupergraph, createGateway, listen } from '../src/supergraph.ts'
import { createOrdersSubgraph, ordersTypeDefs } from './orders-subgraph.ts'

const port = Number(process.env.PORT ?? 4000)
const customers = await listen(await createCustomersSubgraph(), port + 1)
const orders = await listen(await createOrdersSubgraph(), port + 2)
log.info(`[server] subgraph customers at ${customers.url}, subgraph orders at ${orders.url}`)

const supergraphSdl = composeSupergraph([
  { name: 'customers', typeDefs: customersTypeDefs, url: customers.url },
  { name: 'orders', typeDefs: ordersTypeDefs, url: orders.url },
])
const gateway = await listen((await createGateway(supergraphSdl)).app, port)
log.info(`[server] Apollo Gateway ready at ${gateway.url} (Apollo Sandbox)`)
