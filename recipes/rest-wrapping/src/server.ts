import { createServer } from 'node:http'
import { startInventoryService } from './inventory-service.ts'
import { log } from './logger.ts'
import { createGateway } from './yoga.ts'

const port = Number(process.env.PORT ?? 4000)
const inventory = await startInventoryService({ port: port + 1, delayMs: 50 })
const yoga = createGateway({ inventoryUrl: inventory.url })

log.info(`[server] inventory REST service at ${inventory.url}/stock?skus=KB-1,MS-2`)
createServer(yoga).listen(port, () =>
  log.info(`[server] GraphQL Yoga ready at http://localhost:${port}${yoga.graphqlEndpoint}`),
)
