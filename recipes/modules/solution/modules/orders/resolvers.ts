import { GraphQLError } from 'graphql'
import { z } from 'zod'
import type { OrderItemRow, OrderRow } from '../../../src/db.ts'
import type { Context } from '../../context.ts'
import {
  changeOrderItemQuantity,
  listOrders,
  removeOrderItem,
  totalCents,
  type ChangeItemsResult,
} from './logic.ts'

// GraphQL checks the types, zod checks what a type cannot say: quantity 0 is a valid Int.
const ChangeOrderItemQuantityInput = z.strictObject({
  orderId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
})
const RemoveOrderItemInput = z.strictObject({
  orderId: z.string().min(1),
  productId: z.string().min(1),
})

const parseInput = <T>(schema: z.ZodType<T>, input: unknown): T => {
  const parsed = schema.safeParse(input)
  if (parsed.success) return parsed.data
  throw new GraphQLError(parsed.error.issues[0].message, {
    extensions: { code: 'BAD_USER_INPUT' },
  })
}

const requireViewer = ({ viewer }: Context) => {
  if (viewer) return viewer
  throw new GraphQLError('Sign in first.', { extensions: { code: 'UNAUTHENTICATED' } })
}

const orderNotFound = (orderId: string) => ({
  __typename: 'OrderNotFound',
  orderId,
  message: `Order ${orderId} does not exist.`,
})

const orderNotEditable = (order: OrderRow) => ({
  __typename: 'OrderNotEditable',
  orderId: order.id,
  status: order.status,
  message: `Order ${order.id} is ${order.status} and can no longer be changed.`,
})

// The translation: a plain result of the business logic becomes a member of the union.
const toGraphQL = (result: ChangeItemsResult) => {
  if (result.ok) return { __typename: 'ChangeOrderItemsSuccess', order: result.order }
  if (result.reason === 'NOT_FOUND') return orderNotFound(result.orderId)
  return orderNotEditable(result.order)
}

export const resolvers = {
  Query: {
    orders: (_parent: unknown, _args: unknown, context: Context) =>
      listOrders(requireViewer(context)),
  },
  Mutation: {
    changeOrderItemQuantity: async (
      _parent: unknown,
      { input }: { input: unknown },
      context: Context,
    ) =>
      toGraphQL(
        await changeOrderItemQuantity(
          requireViewer(context),
          parseInput(ChangeOrderItemQuantityInput, input),
        ),
      ),
    removeOrderItem: async (_parent: unknown, { input }: { input: unknown }, context: Context) =>
      toGraphQL(
        await removeOrderItem(requireViewer(context), parseInput(RemoveOrderItemInput, input)),
      ),
  },
  OrderItem: {
    product: (item: OrderItemRow, _args: unknown, { loaders }: Context) =>
      loaders.product.load(item.productId),
  },
  Order: {
    totalCents: (order: OrderRow) => totalCents(order),
  },
}
