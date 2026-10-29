import { log } from '../src/logger.ts'
import { createApp } from './app.ts'

const port = Number(process.env.PORT ?? 4000)
const { httpServer } = await createApp()

httpServer.listen(port, () =>
  log.info(
    `[server] Apollo Server ready at http://localhost:${port}/graphql (Apollo Sandbox), subscriptions on ws://localhost:${port}/graphql`,
  ),
)
