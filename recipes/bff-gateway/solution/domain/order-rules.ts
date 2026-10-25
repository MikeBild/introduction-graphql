import { findOrder, listOrders, saveOrder, type Order } from '../../src/domain/orders.ts'
import { log } from '../../src/logger.ts'

export type CancelResult =
  { ok: true; order: Order } | { ok: false; reason: 'NOT_FOUND' | 'NOT_CANCELLABLE' }

// The business rule lives in the domain – GraphQL, jobs and other APIs all call it.
export const canCancel = (order: Order) => order.status === 'OPEN'

export const cancelOrder = (orderId: string): CancelResult => {
  const order = findOrder(orderId)
  if (!order) return { ok: false, reason: 'NOT_FOUND' }
  if (!canCancel(order)) return { ok: false, reason: 'NOT_CANCELLABLE' }
  log.info(`[orders] cancelled ${orderId}`)
  return { ok: true, order: saveOrder({ ...order, status: 'CANCELLED' }) }
}

// A nightly job: same rule, no GraphQL involved.
export const cancelStaleOrders = (now: Date, maxAgeDays: number) =>
  listOrders()
    .filter(
      (order) =>
        canCancel(order) && now.getTime() - Date.parse(order.placedAt) > maxAgeDays * 86_400_000,
    )
    .map((order) => cancelOrder(order.id))
    .filter((result) => result.ok)
    .map((result) => result.order.id)
