import { createServer } from 'node:http'
import { log } from './logger.ts'
import { yoga } from './yoga.ts'

const port = Number(process.env.PORT ?? 4000)

createServer(yoga).listen(port, () =>
  log.info(`[server] GraphQL Yoga ready at http://localhost:${port}${yoga.graphqlEndpoint}`),
)
