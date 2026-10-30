import type { OrderItemRow, OrderRow } from '../../../src/db.ts'
import type { Viewer } from '../../viewer.ts'
import { findOrder, findOrdersByCustomer, saveOrderItems } from './repository.ts'

// Plain values, no GraphQL: a job or a REST endpoint can call the same functions.
export type ChangeItemsResult =
  | { ok: true; order: OrderRow }
  | { ok: false; reason: 'NOT_FOUND'; orderId: string }
  | { ok: false; reason: 'NOT_EDITABLE'; order: OrderRow }

export const canChangeItems = (order: OrderRow) => order.status === 'DRAFT'

export const totalCents = (order: OrderRow) =>
  order.items.reduce((sum, item) => sum + item.quantity * item.priceCents, 0)

export const listOrders = (viewer: Viewer) => findOrdersByCustomer(viewer.id)

const changeItems = async (
  viewer: Viewer,
  orderId: string,
  change: (items: OrderItemRow[]) => OrderItemRow[],
): Promise<ChangeItemsResult> => {
  const order = await findOrder(orderId)
  // A foreign order looks like a missing one: the answer must not reveal that it exists.
  if (!order || order.customerId !== viewer.id) return { ok: false, reason: 'NOT_FOUND', orderId }
  if (!canChangeItems(order)) return { ok: false, reason: 'NOT_EDITABLE', order }
  const saved = await saveOrderItems(order.id, change(order.items))
  return { ok: true, order: saved ?? order }
}

export const removeOrderItem = (
  viewer: Viewer,
  { orderId, productId }: { orderId: string; productId: string },
) => changeItems(viewer, orderId, (items) => items.filter((item) => item.productId !== productId))

export const changeOrderItemQuantity = (
  viewer: Viewer,
  { orderId, productId, quantity }: { orderId: string; productId: string; quantity: number },
) =>
  changeItems(viewer, orderId, (items) =>
    items.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
  )
