import { createSchema, createYoga, type YogaInitialContext } from 'graphql-yoga'
import { ordersOfCustomer, type Order } from '../src/domain/orders.ts'
import { yogaLogger } from '../src/logger.ts'
import { canCancel, cancelOrder } from './domain/order-rules.ts'
import { unwrapCancel } from './graphql-errors.ts'
import { customerIdOf } from '../src/auth.ts'

// BFF for the mobile app: a lean list for small screens, built by the app team.
const typeDefs = /* GraphQL */ `
  type OrderTile {
    id: ID!
    status: String!
    total: Float!
    canCancel: Boolean!
  }

  type Query {
    myOrders: [OrderTile!]!
  }

  type Mutation {
    cancelOrder(id: ID!): OrderTile!
  }
`

const toTile = (order: Order) => ({ ...order, canCancel: canCancel(order) })

export const yoga = createYoga({
  logging: yogaLogger,
  schema: createSchema<YogaInitialContext>({
    typeDefs,
    resolvers: {
      Query: {
        myOrders: (_parent: unknown, _args: unknown, context: YogaInitialContext) =>
          ordersOfCustomer(customerIdOf(context)).map(toTile),
      },
      Mutation: {
        cancelOrder: (_parent: unknown, { id }: { id: string }, context: YogaInitialContext) =>
          toTile(
            unwrapCancel(cancelOrder(id, { kind: 'customer', customerId: customerIdOf(context) })),
          ),
      },
    },
  }),
})
