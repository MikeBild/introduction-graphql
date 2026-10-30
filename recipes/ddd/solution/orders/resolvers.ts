import type { Context } from '../context.ts'
import { totalCents, type Order, type Rejection } from './order.ts'
import { findOpenOrders } from './repository.ts'
import { cancelOrder, type CancelOrderInput } from './use-cases/cancel-order.ts'
import { placeOrder, type PlaceOrderInput } from './use-cases/place-order.ts'
import { removeOrderItem, type RemoveOrderItemInput } from './use-cases/remove-order-item.ts'

// The resolver only translates: an order becomes the payload, a rejection its union member.
const toResult = (payload: string, outcome: Order | Rejection) =>
  'rejected' in outcome
    ? { __typename: outcome.rejected, message: outcome.message }
    : { __typename: payload, order: outcome }

const billingContact = async ({ id }: { id: string }, loaders: Context['loaders']) => {
  const contact = await loaders.billingContact.load(id)
  if (!contact) throw new Error(`No billing contact for customer ${id}`)
  return contact
}

export const resolvers = {
  Query: {
    order: (_parent: unknown, { id }: { id: string }, { loaders }: Context) =>
      loaders.order.load(id),
    openOrders: () => findOpenOrders(),
  },
  Mutation: {
    placeOrder: (_parent: unknown, { input }: { input: PlaceOrderInput }) =>
      toResult('PlaceOrderPayload', placeOrder(input)),
    cancelOrder: (_parent: unknown, { input }: { input: CancelOrderInput }) =>
      toResult('CancelOrderSuccess', cancelOrder(input)),
    removeOrderItem: (_parent: unknown, { input }: { input: RemoveOrderItemInput }) =>
      toResult('RemoveOrderItemSuccess', removeOrderItem(input)),
  },
  Order: {
    totalCents,
    // A reference by id: the Customer type is resolved field by field.
    customer: (order: Order) => ({ id: order.customerId }),
  },
  Customer: {
    name: async (customer: { id: string }, _args: unknown, { loaders }: Context) =>
      (await billingContact(customer, loaders)).name,
    email: async (customer: { id: string }, _args: unknown, { loaders }: Context) =>
      (await billingContact(customer, loaders)).email,
  },
}
