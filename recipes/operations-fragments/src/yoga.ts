import { createSchema, createYoga } from 'graphql-yoga'
import { yogaLogger } from './logger.ts'

type OrderStatus = 'OPEN' | 'PAID' | 'SHIPPED'
type Order = {
  id: string
  status: OrderStatus
  total: number
  customerName: string
  items: { title: string; quantity: number }[]
}

const orders: Order[] = [
  {
    id: 'o-1',
    status: 'OPEN',
    total: 167,
    customerName: 'Ada Lovelace',
    items: [
      { title: 'Keyboard', quantity: 1 },
      { title: 'Mouse', quantity: 2 },
    ],
  },
  {
    id: 'o-2',
    status: 'PAID',
    total: 349,
    customerName: 'Alan Turing',
    items: [{ title: 'Monitor', quantity: 1 }],
  },
  {
    id: 'o-3',
    status: 'OPEN',
    total: 267,
    customerName: 'Alan Turing',
    items: [{ title: 'Keyboard', quantity: 3 }],
  },
  {
    id: 'o-4',
    status: 'PAID',
    total: 39,
    customerName: 'Grace Hopper',
    items: [{ title: 'Mouse', quantity: 1 }],
  },
]

const typeDefs = /* GraphQL */ `
  enum OrderStatus {
    OPEN
    PAID
    SHIPPED
  }

  type Customer {
    name: String!
  }

  type OrderItem {
    title: String!
    quantity: Int!
  }

  type Order {
    id: ID!
    status: OrderStatus!
    total: Float!
    customer: Customer!
    items: [OrderItem!]!
  }

  type Query {
    orders(status: OrderStatus, first: Int! = 10): [Order!]!
    order(id: ID!): Order
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
          { status, first }: { status?: OrderStatus | null; first: number },
        ) => orders.filter((order) => !status || order.status === status).slice(0, first),
        order: (_parent: unknown, { id }: { id: string }) =>
          orders.find((order) => order.id === id) ?? null,
      },
      Order: {
        customer: (order: Order) => ({ name: order.customerName }),
      },
    },
  }),
})
