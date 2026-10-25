import { EmailAddressResolver } from 'graphql-scalars'
import { createSchema, createYoga } from 'graphql-yoga'
import { yogaLogger } from '../src/logger.ts'
import { orders, placedAfter } from '../src/orders.ts'
import { DateTime } from './scalars.ts'

const typeDefs = /* GraphQL */ `
  scalar DateTime @specifiedBy(url: "https://www.rfc-editor.org/rfc/rfc3339")
  scalar EmailAddress

  type Order {
    id: ID!
    placedAt: DateTime!
    contactEmail: EmailAddress
  }

  input OrderFilter {
    placedAfter: DateTime
  }

  type Query {
    orders(filter: OrderFilter): [Order!]!
  }

  type Mutation {
    updateContactEmail(orderId: ID!, email: EmailAddress!): Order
  }
`

export const yoga = createYoga({
  logging: yogaLogger,
  schema: createSchema({
    typeDefs,
    resolvers: {
      DateTime,
      EmailAddress: EmailAddressResolver,
      Query: {
        // filter.placedAfter already is a Date – the scalar parsed and validated it.
        orders: (_parent: unknown, { filter }: { filter?: { placedAfter?: Date | null } | null }) =>
          placedAfter(filter?.placedAfter),
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
    },
  }),
})
