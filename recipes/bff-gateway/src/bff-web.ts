import { GraphQLError } from 'graphql'
import { notFound, requireCustomer, type Context } from './auth.ts'
import { createBffApp } from './bff-app-factory.ts'
import { findCustomer } from './domain/customers.ts'
import { findOrder, saveOrder, totalCents, type Order } from './domain/orders.ts'
import { log } from './logger.ts'

// BFF for the web shop: the schema follows the web pages, not the database.
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
    canCancel: order.status === 'DRAFT' || order.status === 'PLACED',
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
        // Smell: the business rule lives in the resolver. A job or a second BFF would have to copy it.
        cancelOrder: (_parent: unknown, { id }: { id: string }, context: Context) => {
          const order = findOrder(id)
          if (!order || order.customerId !== requireCustomer(context)) throw notFound()
          if (order.status !== 'DRAFT' && order.status !== 'PLACED')
            throw new GraphQLError('Only draft or placed orders can be cancelled', {
              extensions: { code: 'NOT_CANCELLABLE' },
            })
          log.info(`[orders] cancelled ${id}`)
          return toOrderPage(saveOrder({ ...order, status: 'CANCELLED' }))
        },
      },
    },
  })
