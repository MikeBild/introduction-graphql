import { place } from '../order.ts'
import { change } from '../repository.ts'

export type PlaceOrderInput = { orderId: string }

// One file per mutation: the use case names the root and the operation of the aggregate.
export const placeOrder = ({ orderId }: PlaceOrderInput) => change(orderId, place)
