import { createCustomersSubgraph, customersTypeDefs } from './customers-subgraph.ts'
import { log } from './logger.ts'
import { createOrdersSubgraph, ordersTypeDefs } from './orders-subgraph.ts'
import { composeSupergraph, createGateway, listen } from './supergraph.ts'

const port = Number(process.env.PORT ?? 4000)
const customers = await listen(createCustomersSubgraph(), port + 1)
const orders = await listen(createOrdersSubgraph(), port + 2)
log.info(`[server] subgraph customers at ${customers.url}, subgraph orders at ${orders.url}`)

const supergraphSdl = composeSupergraph([
  { name: 'customers', typeDefs: customersTypeDefs, url: customers.url },
  { name: 'orders', typeDefs: ordersTypeDefs, url: orders.url },
])
const gateway = await listen(createGateway(supergraphSdl), port)
log.info(`[server] gateway ready at ${gateway.url}`)
