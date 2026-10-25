import DataLoader from 'dataloader'
import { GraphQLError } from 'graphql'
import type { StockRow } from '../src/inventory-service.ts'
import { log } from '../src/logger.ts'

const TIMEOUT_MS = 300

const upstreamError = (error: unknown, url: string) => {
  const isTimeout = error instanceof DOMException && error.name === 'TimeoutError'
  log.warn(`[inventory] ${isTimeout ? 'timeout' : 'failed'} ${url}: ${String(error)}`)
  return new GraphQLError(
    isTimeout ? 'Inventory did not answer in time.' : 'Inventory is not available.',
    {
      extensions: { code: isTimeout ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_ERROR' },
    },
  )
}

// One client module per REST service: timeout, token forwarding and error mapping in one place.
export const fetchJson = async <T>(url: string, token: string | null): Promise<T> => {
  try {
    const response = await fetch(url, {
      headers: token ? { authorization: token } : {},
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!response.ok) throw new Error(`Upstream ${response.status}`)
    return (await response.json()) as T
  } catch (error) {
    throw upstreamError(error, url)
  }
}

// Created per request: bundles all SKUs of one GraphQL request into a single REST call.
export const createStockLoader = (inventoryUrl: string, token: string | null) =>
  new DataLoader<string, number | null>(async (skus) => {
    const query = new URLSearchParams({ skus: skus.join(',') })
    const rows = await fetchJson<StockRow[]>(`${inventoryUrl}/stock?${query}`, token)
    const availableBySku = new Map(rows.map((row) => [row.sku, row.available]))
    return skus.map((sku) => availableBySku.get(sku) ?? null)
  })
