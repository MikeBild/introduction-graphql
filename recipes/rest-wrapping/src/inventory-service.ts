import { setTimeout as sleep } from 'node:timers/promises'
import express from 'express'
import { log } from './logger.ts'

export type StockRow = { productId: string; stock: number }
type InventoryOptions = { port?: number; delayMs?: number; failingIds?: string[] }

const stockByProduct = new Map([
  ['p-1', 12],
  ['p-2', 0],
  ['p-3', 4],
])

// A stand-in for an existing REST service that another team operates (Express 5).
export const startInventoryService = ({
  port = 0,
  delayMs = 0,
  failingIds = [],
}: InventoryOptions = {}) => {
  const requests: string[] = []
  const authorizations: (string | undefined)[] = []
  const app = express()

  app.use(async (req, _res, next) => {
    requests.push(decodeURIComponent(req.originalUrl))
    authorizations.push(req.headers.authorization)
    log.debug(`[inventory] ${req.method} ${req.originalUrl}`)
    await sleep(delayMs)
    next()
  })

  const rowsFor = (ids: string[]): StockRow[] | undefined =>
    ids.some((id) => failingIds.includes(id))
      ? undefined
      : ids.map((productId) => ({ productId, stock: stockByProduct.get(productId) ?? 0 }))

  // Single resource: GET /stock/p-1
  app.get('/stock/:productId', (req, res) => {
    const rows = rowsFor([req.params.productId])
    if (!rows) res.status(503).json({ message: 'inventory db down' })
    else res.json(rows[0])
  })

  // Collection: GET /stock?ids=p-1,p-2
  app.get('/stock', (req, res) => {
    const rows = rowsFor(
      String(req.query.ids ?? '')
        .split(',')
        .filter(Boolean),
    )
    if (!rows) res.status(503).json({ message: 'inventory db down' })
    else res.json(rows)
  })

  return new Promise<{
    url: string
    requests: string[]
    authorizations: (string | undefined)[]
    close: () => void
  }>((resolve) => {
    const server = app.listen(port, () => {
      const address = server.address()
      const actualPort = typeof address === 'object' && address ? address.port : port
      resolve({
        url: `http://localhost:${actualPort}`,
        requests,
        authorizations,
        close: () => server.close(),
      })
    })
  })
}
