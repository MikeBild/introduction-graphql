import { removeItem } from '../order.ts'
import { change } from '../repository.ts'

export type RemoveOrderItemInput = { orderId: string; productId: string }

export const removeOrderItem = ({ orderId, productId }: RemoveOrderItemInput) =>
  change(orderId, removeItem(productId))
