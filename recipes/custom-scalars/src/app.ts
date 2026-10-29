import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { createdAfter, findCustomer, updateEmail, type Order } from './orders.ts'

// Starting point: dates and e-mails are plain strings – every resolver has to check them itself.
const typeDefs = /* GraphQL */ `
  type Customer {
    id: ID!
    name: String!
    email: String!
  }

  type Order {
    id: ID!
    createdAt: String!
    customer: Customer!
  }

  input OrderFilter {
    createdAfter: String
  }

  type Query {
    orders(filter: OrderFilter): [Order!]!
  }

  type Mutation {
    updateCustomerEmail(customerId: ID!, email: String!): Customer
  }
`

const resolvers = {
  Query: {
    orders: (_parent: unknown, { filter }: { filter?: { createdAfter?: string | null } | null }) =>
      createdAfter(filter?.createdAfter ? new Date(filter.createdAfter) : null),
  },
  Mutation: {
    updateCustomerEmail: (
      _parent: unknown,
      { customerId, email }: { customerId: string; email: string },
    ) => updateEmail(customerId, email),
  },
  Order: {
    createdAt: (order: Order) => order.createdAt.toISOString(),
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
