import { cancel } from '../order.ts'
import { change } from '../repository.ts'

export type CancelOrderInput = { orderId: string }

export const cancelOrder = ({ orderId }: CancelOrderInput) => change(orderId, cancel)
