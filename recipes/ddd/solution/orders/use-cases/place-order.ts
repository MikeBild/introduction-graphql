import { place } from '../order.ts'
import { change } from '../repository.ts'

export type PlaceOrderInput = { orderId: string }

export const placeOrder = ({ orderId }: PlaceOrderInput) => change(orderId, place)
