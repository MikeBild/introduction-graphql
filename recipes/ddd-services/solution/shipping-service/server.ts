import { log } from '../../src/logger.ts'
import { createShippingApp } from './app.ts'

const port = Number(process.env.PORT ?? 4001)

createShippingApp().listen(port, () => log.info(`[shipping] ready at http://localhost:${port}`))
