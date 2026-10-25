import { createSchema, createYoga } from 'graphql-yoga'
import { findCustomer } from '../src/domain/customers.ts'
import { findOrder, type Order } from '../src/domain/orders.ts'
import { yogaLogger } from '../src/logger.ts'
import { canCancel, cancelOrder } from './domain/order-rules.ts'
import { unwrapCancel } from './graphql-errors.ts'

const typeDefs = /* GraphQL */ `
  type OrderPage {
    id: ID!
    status: String!
    total: Float!
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
    customerName: customer?.name ?? 'unknown',
    customerEmail: customer?.email ?? '',
    canCancel: canCancel(order),
  }
}

export const yoga = createYoga({
  logging: yogaLogger,
  schema: createSchema({
    typeDefs,
    resolvers: {
      Query: {
        orderPage: (_parent: unknown, { id }: { id: string }) => {
          const order = findOrder(id)
          return order ? toOrderPage(order) : null
        },
      },
      Mutation: {
        cancelOrder: (_parent: unknown, { id }: { id: string }) =>
          toOrderPage(unwrapCancel(cancelOrder(id))),
      },
    },
  }),
})
