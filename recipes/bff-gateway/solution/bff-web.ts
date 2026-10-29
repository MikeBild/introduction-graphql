import { requireCustomer, type Context } from '../src/auth.ts'
import { createBffApp } from '../src/bff-app-factory.ts'
import { findCustomer } from '../src/domain/customers.ts'
import { findOrder, totalCents, type Order } from '../src/domain/orders.ts'
import { canCancel, cancelOrder } from './domain/order-rules.ts'
import { unwrapCancel } from './graphql-errors.ts'

const typeDefs = /* GraphQL */ `
  enum OrderStatus {
    DRAFT
    PLACED
    PAID
    SHIPPED
    CANCELLED
  }

  type OrderPage {
    id: ID!
    status: OrderStatus!
    totalCents: Int!
    customerName: String!
    customerEmail: String!
    canCancel: Boolean!
  }

  type Query {
    orderPage(id: ID!): OrderPage
  }

  type Mutation {
    cancelOrder(id: ID!): OrderPage!
  }
`

const toOrderPage = (order: Order) => {
  const customer = findCustomer(order.customerId)
  return {
    ...order,
    totalCents: totalCents(order),
    customerName: customer?.name ?? 'unknown',
    customerEmail: customer?.email ?? '',
    canCancel: canCancel(order),
  }
}

export const createWebBff = () =>
  createBffApp({
    typeDefs,
    resolvers: {
      Query: {
        orderPage: (_parent: unknown, { id }: { id: string }, context: Context) => {
          const order = findOrder(id)
          return order && order.customerId === requireCustomer(context) ? toOrderPage(order) : null
        },
      },
      Mutation: {
        cancelOrder: (_parent: unknown, { id }: { id: string }, context: Context) =>
          toOrderPage(
            unwrapCancel(
              cancelOrder(id, { kind: 'customer', customerId: requireCustomer(context) }),
            ),
          ),
      },
    },
  })
