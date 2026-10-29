import { findOrder, listOrders, saveOrder, type Order } from '../../src/domain/orders.ts'
import { log } from '../../src/logger.ts'

// Who cancels: a customer may cancel only own orders, the system (nightly job) any order
export type Requester = { kind: 'customer'; customerId: string } | { kind: 'system' }
export type CancelResult =
  { ok: true; order: Order } | { ok: false; reason: 'NOT_FOUND' | 'NOT_CANCELLABLE' }

// The business rule lives in the domain – GraphQL, jobs and other APIs all call it.
// CANCELLED only from DRAFT or PLACED.
export const canCancel = (order: Order) => order.status === 'DRAFT' || order.status === 'PLACED'

const mayAccess = (order: Order, requester: Requester) =>
  requester.kind === 'system' || order.customerId === requester.customerId

export const cancelOrder = (orderId: string, requester: Requester): CancelResult => {
  const order = findOrder(orderId)
  // foreign orders are reported as missing – nothing reveals that they exist
  if (!order || !mayAccess(order, requester)) return { ok: false, reason: 'NOT_FOUND' }
  if (!canCancel(order)) return { ok: false, reason: 'NOT_CANCELLABLE' }
  log.info(`[orders] cancelled ${orderId}`)
  return { ok: true, order: saveOrder({ ...order, status: 'CANCELLED' }) }
}

// A nightly job: same rule, no GraphQL involved.
export const cancelStaleOrders = (now: Date, maxAgeDays: number) =>
  listOrders()
    .filter(
      (order) =>
        canCancel(order) && now.getTime() - Date.parse(order.createdAt) > maxAgeDays * 86_400_000,
    )
    .map((order) => cancelOrder(order.id, { kind: 'system' }))
    .filter((result) => result.ok)
    .map((result) => result.order.id)
