import { existsSync } from 'node:fs'
import { log } from '../src/logger.ts'
import { databasePath } from '../src/seed.ts'
import { createApp } from './app.ts'
import { createFastDb } from './db.ts'

if (!existsSync(databasePath)) {
  log.error(`[server] ${databasePath} not found. Run npm run seed first.`)
  process.exit(1)
}

const port = Number(process.env.PORT ?? 4000)
const app = await createApp(createFastDb(databasePath))

app.listen(port, () =>
  log.info(`[server] Apollo Server ready at http://localhost:${port}/graphql (Apollo Sandbox)`),
)
