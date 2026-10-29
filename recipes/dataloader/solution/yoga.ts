import { createSchema, createYoga } from 'graphql-yoga'
import { db, type OrderRow } from '../src/db.ts'
import { yogaLogger } from '../src/logger.ts'
import { createLoaders, type Loaders } from './loaders.ts'

export type Context = { loaders: Loaders }

const typeDefs = /* GraphQL */ `
  type Customer {
    id: ID!
    name: String!
  }

  type Order {
    id: ID!
    total: Float!
    "null when the customer no longer exists"
    customer: Customer
  }

  type Query {
    orders: [Order!]!
  }

  type Mutation {
    renameCustomer(id: ID!, name: String!): Customer
  }
`

export const yoga = createYoga({
  logging: yogaLogger,
  // Runs once per request: fresh loaders, fresh cache.
  context: (): Context => ({ loaders: createLoaders() }),
  schema: createSchema<Context>({
    typeDefs,
    resolvers: {
      Query: {
        orders: () => db.orders.findMany(),
      },
      Mutation: {
        renameCustomer: async (
          _parent: unknown,
          { id, name }: { id: string; name: string },
          { loaders }: Context,
        ) => {
          if (!(await loaders.customer.load(id))) return null
          await db.customers.rename(id, name)
          // The loader still holds the old name for this request: clear it, then reload.
          return loaders.customer.clear(id).load(id)
        },
      },
      Order: {
        customer: (order: OrderRow, _args: unknown, { loaders }: Context) =>
          loaders.customer.load(order.customerId),
      },
    },
  }),
})
