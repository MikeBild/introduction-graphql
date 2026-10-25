import { createSchema, createYoga } from 'graphql-yoga'
import { findCustomer, orders, type Order, type OrderItem, type OrderStatus } from './data.ts'
import { yogaLogger } from './logger.ts'

const typeDefs = /* GraphQL */ `
  enum OrderStatus {
    OPEN
    PAID
    SHIPPED
  }

  type Customer {
    id: ID!
    name: String!
    email: String!
    city: String!
  }

  type OrderItem {
    productId: ID!
    quantity: Int!
  }

  type Order {
    id: ID!
    status: OrderStatus!
    createdAt: String!
    customer: Customer!
    items: [OrderItem!]!
  }

  type Query {
    orders(status: OrderStatus): [Order!]!
  }
`

export const yoga = createYoga({
  logging: yogaLogger,
  schema: createSchema({
    typeDefs,
    resolvers: {
      Query: {
        orders: (_parent: unknown, { status }: { status?: OrderStatus | null }) =>
          status ? orders.filter((order) => order.status === status) : orders,
      },
      Order: {
        customer: (order: Order) => findCustomer(order.customerId),
        items: (order: Order): OrderItem[] => order.items,
      },
    },
  }),
})
