import { buildSubgraphSchema } from '@apollo/subgraph'
import { parse } from 'graphql'
import { createSubgraphApp } from '../src/supergraph.ts'
import { orders, type Order } from '../src/orders-subgraph.ts'

// The order team contributes Customer.orders – the customer team does not have to change anything.
export const ordersTypeDefs = parse(/* GraphQL */ `
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key"])

  enum OrderStatus {
    OPEN
    PAID
  }

  type Order @key(fields: "id") {
    id: ID!
    status: OrderStatus!
    customer: Customer!
  }

  type Customer @key(fields: "id") {
    id: ID!
    orders: [Order!]!
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
          Customer: {
            __resolveReference: ({ id }: { id: string }) => ({ id }),
            orders: ({ id }: { id: string }) => orders.filter((order) => order.customerId === id),
          },
        },
      },
    ]),
  })
