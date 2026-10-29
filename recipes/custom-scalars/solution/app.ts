import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { EmailAddressResolver } from 'graphql-scalars'
import { createdAfter, findCustomer, updateEmail, type Order } from '../src/orders.ts'
import { DateTime } from './scalars.ts'

const typeDefs = /* GraphQL */ `
  scalar DateTime @specifiedBy(url: "https://www.rfc-editor.org/rfc/rfc3339")
  scalar EmailAddress

  type Customer {
    id: ID!
    name: String!
    email: EmailAddress!
  }

  type Order {
    id: ID!
    createdAt: DateTime!
    customer: Customer!
  }

  input OrderFilter {
    createdAfter: DateTime
  }

  type Query {
    orders(filter: OrderFilter): [Order!]!
  }

  type Mutation {
    updateCustomerEmail(customerId: ID!, email: EmailAddress!): Customer
  }
`

const resolvers = {
  DateTime,
  EmailAddress: EmailAddressResolver,
  Query: {
    // filter.createdAfter already is a Date – the scalar parsed and validated it.
    orders: (_parent: unknown, { filter }: { filter?: { createdAfter?: Date | null } | null }) =>
      createdAfter(filter?.createdAfter),
  },
  Mutation: {
    updateCustomerEmail: (
      _parent: unknown,
      { customerId, email }: { customerId: string; email: string },
    ) => updateEmail(customerId, email),
  },
  Order: {
    customer: (order: Order) => findCustomer(order.customerId),
  },
}

export const createApp = async () => {
  const server = new ApolloServer({ typeDefs, resolvers })
  await server.start()
  const app = express()
  app.use('/graphql', express.json(), expressMiddleware(server))
  return app
}
