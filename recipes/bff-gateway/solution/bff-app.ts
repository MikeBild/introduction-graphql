import { requireCustomer, type Context } from '../src/auth.ts'
import { createBffApp } from '../src/bff-app-factory.ts'
import { ordersOfCustomer, totalCents, type Order } from '../src/domain/orders.ts'
import { canCancel, cancelOrder } from './domain/order-rules.ts'
import { unwrapCancel } from './graphql-errors.ts'

// BFF for the mobile app: a lean list for small screens, built by the app team.
const typeDefs = /* GraphQL */ `
  enum OrderStatus {
    DRAFT
    PLACED
    PAID
    SHIPPED
    CANCELLED
  }

  type OrderTile {
    id: ID!
    status: OrderStatus!
    totalCents: Int!
    canCancel: Boolean!
  }

  type Query {
    myOrders: [OrderTile!]!
  }

  type Mutation {
    cancelOrder(id: ID!): OrderTile!
  }
`

const toTile = (order: Order) => ({
  ...order,
  totalCents: totalCents(order),
  canCancel: canCancel(order),
})

export const createAppBff = () =>
  createBffApp({
    typeDefs,
    resolvers: {
      Query: {
        myOrders: (_parent: unknown, _args: unknown, context: Context) =>
          ordersOfCustomer(requireCustomer(context)).map(toTile),
      },
      Mutation: {
        cancelOrder: (_parent: unknown, { id }: { id: string }, context: Context) =>
          toTile(
            unwrapCancel(
              cancelOrder(id, { kind: 'customer', customerId: requireCustomer(context) }),
            ),
          ),
      },
    },
  })
