import type { Context } from '../context.ts'
import { totalCents, type Order, type Rejection } from './order.ts'
import { findOpenOrders } from './repository.ts'
import { placeOrder, type PlaceOrderInput } from './use-cases/place-order.ts'
import { updateOrder, type UpdateOrderInput } from './use-cases/update-order.ts'

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
    updateOrder: (_parent: unknown, { input }: { input: UpdateOrderInput }) =>
      toResult('UpdateOrderPayload', updateOrder(input)),
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
