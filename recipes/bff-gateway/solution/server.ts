import { log } from '../src/logger.ts'
import { createAppBff } from './bff-app.ts'
import { createWebBff } from './bff-web.ts'

const port = Number(process.env.PORT ?? 4000)
const [web, app] = await Promise.all([createWebBff(), createAppBff()])

// Two BFFs, two deployables – each team ships its own.
web.listen(port, () => log.info(`[server] web BFF ready at http://localhost:${port}/graphql`))
app.listen(port + 1, () =>
  log.info(`[server] app BFF ready at http://localhost:${port + 1}/graphql`),
)
