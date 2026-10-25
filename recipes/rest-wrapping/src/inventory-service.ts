import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { setTimeout as sleep } from 'node:timers/promises'
import { log } from './logger.ts'

export type StockRow = { sku: string; available: number }
type InventoryOptions = { port?: number; delayMs?: number; failingSkus?: string[] }

const stockBySku = new Map([
  ['KB-1', 12],
  ['MS-2', 0],
  ['MN-3', 4],
])

// A stand-in for an existing REST service that another team operates.
export const startInventoryService = ({
  port = 0,
  delayMs = 0,
  failingSkus = [],
}: InventoryOptions = {}) =>
  new Promise<{
    url: string
    requests: string[]
    authorizations: (string | undefined)[]
    close: () => void
  }>((resolve) => {
    const requests: string[] = []
    const authorizations: (string | undefined)[] = []
    const server = createServer(async (request, response) => {
      const { pathname, searchParams } = new URL(request.url ?? '/', 'http://inventory')
      requests.push(`${pathname}${searchParams.size ? `?${searchParams}` : ''}`)
      authorizations.push(request.headers.authorization)
      log.debug(`[inventory] ${request.method} ${request.url}`)
      await sleep(delayMs)
      const skus = pathname.startsWith('/stock/')
        ? [decodeURIComponent(pathname.slice('/stock/'.length))]
        : (searchParams.get('skus')?.split(',') ?? [])
      if (skus.some((sku) => failingSkus.includes(sku))) {
        response
          .writeHead(503, { 'content-type': 'application/json' })
          .end('{"message":"inventory db down"}')
        return
      }
      const rows: StockRow[] = skus.map((sku) => ({ sku, available: stockBySku.get(sku) ?? 0 }))
      response
        .writeHead(200, { 'content-type': 'application/json' })
        .end(JSON.stringify(pathname.startsWith('/stock/') ? rows[0] : rows))
    }).listen(port, () => {
      const url = `http://localhost:${(server.address() as AddressInfo).port}`
      resolve({ url, requests, authorizations, close: () => server.close() })
    })
  })
