import { createServer } from 'node:http'
import { yoga } from './bff-web.ts'
import { log } from './logger.ts'

const port = Number(process.env.PORT ?? 4000)

createServer(yoga).listen(port, () =>
  log.info(`[server] web BFF ready at http://localhost:${port}${yoga.graphqlEndpoint}`),
)
