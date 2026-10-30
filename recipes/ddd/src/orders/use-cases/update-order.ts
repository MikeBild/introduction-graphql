import type { OrderItem, OrderStatus } from '../order.ts'
import { change } from '../repository.ts'

export type UpdateOrderInput = {
  orderId: string
  customerId?: string | null
  status?: OrderStatus | null
  items?: readonly OrderItem[] | null
}

// A broad update: it writes whatever the client sends, so no rule of the aggregate runs.
export const updateOrder = ({ orderId, customerId, status, items }: UpdateOrderInput) =>
  change(orderId, (order) => ({
    ...order,
    customerId: customerId ?? order.customerId,
    status: status ?? order.status,
    items: items ?? order.items,
  }))
