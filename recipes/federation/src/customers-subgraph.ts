import { buildSubgraphSchema } from '@apollo/subgraph'
import { parse } from 'graphql'
import { createYoga } from 'graphql-yoga'
import { yogaLogger } from './logger.ts'

type Customer = { id: string; name: string }
const customers: Customer[] = [
  { id: 'c-1', name: 'Ada Lovelace' },
  { id: 'c-2', name: 'Alan Turing' },
]

// Owned by the customer team.
export const customersTypeDefs = parse(/* GraphQL */ `
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key"])

  type Customer @key(fields: "id") {
    id: ID!
    name: String!
  }

  type Query {
    customers: [Customer!]!
  }
`)

export const createCustomersSubgraph = () =>
  createYoga({
    logging: yogaLogger,
    schema: buildSubgraphSchema([
      {
        typeDefs: customersTypeDefs,
        resolvers: {
          Query: { customers: () => customers },
          Customer: {
            // Called by the gateway when another subgraph only knows the customer id.
            __resolveReference: ({ id }: { id: string }) =>
              customers.find((customer) => customer.id === id),
          },
        },
      },
    ]),
  })
