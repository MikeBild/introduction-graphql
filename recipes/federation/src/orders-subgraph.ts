import { buildSubgraphSchema } from '@apollo/subgraph'
import { parse } from 'graphql'
import { createSubgraphApp } from './supergraph.ts'

export type Order = {
  id: string
  status: 'DRAFT' | 'PLACED' | 'PAID' | 'SHIPPED' | 'CANCELLED'
  customerId: string
}
export const orders: Order[] = [
  { id: 'o-1', status: 'PLACED', customerId: 'c-1' },
  { id: 'o-2', status: 'PAID', customerId: 'c-2' },
  { id: 'o-3', status: 'PLACED', customerId: 'c-2' },
]

// Owned by the order team. It knows only the id of a customer.
export const ordersTypeDefs = parse(/* GraphQL */ `
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key"])

  enum OrderStatus {
    DRAFT
    PLACED
    PAID
    SHIPPED
    CANCELLED
  }

  type Order @key(fields: "id") {
    id: ID!
    status: OrderStatus!
    customer: Customer!
  }

  type Customer @key(fields: "id", resolvable: false) {
    id: ID!
  }

  type Query {
    orders: [Order!]!
  }
`)

export const createOrdersSubgraph = () =>
  createSubgraphApp({
    schema: buildSubgraphSchema([
      {
        typeDefs: ordersTypeDefs,
        resolvers: {
          Query: { orders: () => orders },
          Order: { customer: (order: Order) => ({ id: order.customerId }) },
        },
      },
    ]),
  })
