import { createWebBff } from './bff-web.ts'
import { log } from './logger.ts'

const port = Number(process.env.PORT ?? 4000)
const web = await createWebBff()

web.listen(port, () =>
  log.info(`[server] web BFF ready at http://localhost:${port}/graphql (Apollo Sandbox)`),
)
