import { startInventoryService } from './inventory-service.ts'
import { log } from './logger.ts'
import { createApp } from './app.ts'

const port = Number(process.env.PORT ?? 4000)
const inventory = await startInventoryService({ port: port + 1, delayMs: 50 })
const app = await createApp({ inventoryUrl: inventory.url })

log.info(`[server] inventory REST service at ${inventory.url}/stock?ids=p-1,p-2`)
app.listen(port, () =>
  log.info(`[server] Apollo Server ready at http://localhost:${port}/graphql (Apollo Sandbox)`),
)
