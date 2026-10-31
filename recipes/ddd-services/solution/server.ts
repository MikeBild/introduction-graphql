import { log } from '../src/logger.ts'
import { createApp } from './app.ts'

const port = Number(process.env.PORT ?? 4000)
const shippingUrl = process.env.SHIPPING_URL ?? 'http://localhost:4001'
const app = await createApp({ shippingUrl })

app.listen(port, () =>
  log.info(
    `[server] Apollo Server ready at http://localhost:${port}/graphql (Apollo Sandbox), shipping at ${shippingUrl}`,
  ),
)
