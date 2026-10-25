import { createServer } from 'node:http'
import { log } from '../src/logger.ts'
import { yoga as appBff } from './bff-app.ts'
import { yoga as webBff } from './bff-web.ts'

const port = Number(process.env.PORT ?? 4000)

createServer(webBff).listen(port, () =>
  log.info(`[server] web BFF ready at http://localhost:${port}/graphql`),
)
createServer(appBff).listen(port + 1, () =>
  log.info(`[server] app BFF ready at http://localhost:${port + 1}/graphql`),
)
