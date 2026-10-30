import { existsSync } from 'node:fs'
import { createApp } from './app.ts'
import { createDb } from './db.ts'
import { log } from './logger.ts'
import { databasePath } from './seed.ts'

if (!existsSync(databasePath)) {
  log.error(`[server] ${databasePath} not found. Run npm run seed first.`)
  process.exit(1)
}

const port = Number(process.env.PORT ?? 4000)
const app = await createApp(createDb(databasePath))

app.listen(port, () =>
  log.info(`[server] Apollo Server ready at http://localhost:${port}/graphql (Apollo Sandbox)`),
)
