import { createSchema, createYoga } from 'graphql-yoga'
import { yogaLogger } from './logger.ts'
import { orders, placedAfter, type Order } from './orders.ts'

// Starting point: dates and e-mails are plain strings – every resolver has to check them itself.
const typeDefs = /* GraphQL */ `
  type Order {
    id: ID!
    placedAt: String!
    contactEmail: String
  }

  input OrderFilter {
    placedAfter: String
  }

  type Query {
    orders(filter: OrderFilter): [Order!]!
  }

  type Mutation {
    updateContactEmail(orderId: ID!, email: String!): Order
  }
`

export const yoga = createYoga({
  logging: yogaLogger,
  schema: createSchema({
    typeDefs,
    resolvers: {
      Query: {
        orders: (
          _parent: unknown,
          { filter }: { filter?: { placedAfter?: string | null } | null },
        ) => placedAfter(filter?.placedAfter ? new Date(filter.placedAfter) : null),
      },
      Mutation: {
        updateContactEmail: (
          _parent: unknown,
          { orderId, email }: { orderId: string; email: string },
        ) => {
          const order = orders.find((candidate) => candidate.id === orderId)
          if (order) order.contactEmail = email
          return order ?? null
        },
      },
      Order: {
        placedAt: (order: Order) => order.placedAt.toISOString(),
      },
    },
  }),
})
