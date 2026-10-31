import type { Context } from '../context.ts'
import { totalCents, type Order } from './order.ts'
import { findOpenOrders } from './repository.ts'

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
