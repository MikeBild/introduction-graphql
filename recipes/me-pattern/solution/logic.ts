import { db, type OrderRow } from '../src/db.ts'
import type { Viewer } from '../src/context.ts'

const isSupport = (viewer: Viewer) => viewer.roles.includes('SUPPORT')

// The rule behind the view. Same field, different viewer, different orders.
export const listOrders = (viewer: Viewer) =>
  isSupport(viewer) ? db.orders.findMany() : db.orders.findByCustomer(viewer.id)

// One function for the field and the mutation: the button and the server cannot disagree.
export const canCancel = (viewer: Viewer, order: OrderRow) =>
  ['DRAFT', 'PLACED'].includes(order.status) &&
  (order.customerId === viewer.id || isSupport(viewer))

export const cancelOrder = async (viewer: Viewer, orderId: string) => {
  const order = await db.orders.findById(orderId)
  if (!order || !canCancel(viewer, order)) return null
  return db.orders.updateStatus(order.id, 'CANCELLED')
}
