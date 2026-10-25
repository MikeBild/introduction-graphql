import { GraphQLError } from 'graphql'
import { createSchema, createYoga, type YogaInitialContext } from 'graphql-yoga'
import { customerIdOf, notFound } from './auth.ts'
import { findCustomer } from './domain/customers.ts'
import { findOrder, saveOrder, type Order } from './domain/orders.ts'
import { log, yogaLogger } from './logger.ts'

// BFF for the web shop: the schema follows the web pages, not the database.
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
    canCancel: order.status === 'OPEN',
  }
}

export const yoga = createYoga({
  logging: yogaLogger,
  schema: createSchema<YogaInitialContext>({
    typeDefs,
    resolvers: {
      Query: {
        orderPage: (_parent: unknown, { id }: { id: string }, context: YogaInitialContext) => {
          const order = findOrder(id)
          return order && order.customerId === customerIdOf(context) ? toOrderPage(order) : null
        },
      },
      Mutation: {
        // Smell: the business rule lives in the resolver. A job or a second BFF would have to copy it.
        cancelOrder: (_parent: unknown, { id }: { id: string }, context: YogaInitialContext) => {
          const order = findOrder(id)
          if (!order || order.customerId !== customerIdOf(context)) throw notFound()
          if (order.status !== 'OPEN')
            throw new GraphQLError('Only open orders can be cancelled', {
              extensions: { code: 'NOT_CANCELLABLE' },
            })
          log.info(`[orders] cancelled ${id}`)
          return toOrderPage(saveOrder({ ...order, status: 'CANCELLED' }))
        },
      },
    },
  }),
})
