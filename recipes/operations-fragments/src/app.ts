import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'

// Werkstatt-Shop: money is always integer cents.
type OrderStatus = 'DRAFT' | 'PLACED' | 'PAID' | 'SHIPPED' | 'CANCELLED'
type Product = { id: string; name: string; priceCents: number }
type Customer = { id: string; name: string }
type OrderItem = { productId: string; quantity: number; priceCents: number }
type Order = { id: string; customerId: string; items: OrderItem[]; status: OrderStatus }

const products: Product[] = [
  { id: 'p-1', name: 'Keyboard', priceCents: 8900 },
  { id: 'p-2', name: 'Mouse', priceCents: 3900 },
  { id: 'p-3', name: 'Monitor', priceCents: 34900 },
]

const customers: Customer[] = [
  { id: 'c-1', name: 'Ada Lovelace' },
  { id: 'c-2', name: 'Alan Turing' },
  { id: 'c-3', name: 'Grace Hopper' },
]

const item = (productId: string, quantity: number): OrderItem => ({
  productId,
  quantity,
  priceCents: products.find((product) => product.id === productId)?.priceCents ?? 0,
})

const orders: Order[] = [
  { id: 'o-1', customerId: 'c-1', items: [item('p-1', 1), item('p-2', 2)], status: 'PLACED' },
  { id: 'o-2', customerId: 'c-2', items: [item('p-3', 1)], status: 'PAID' },
  { id: 'o-3', customerId: 'c-2', items: [item('p-1', 3)], status: 'PLACED' },
  { id: 'o-4', customerId: 'c-3', items: [item('p-2', 1)], status: 'PAID' },
]

const typeDefs = /* GraphQL */ `
  enum OrderStatus {
    DRAFT
    PLACED
    PAID
    SHIPPED
    CANCELLED
  }

  type Customer {
    id: ID!
    name: String!
  }

  type Product {
    id: ID!
    name: String!
    priceCents: Int!
  }

  type OrderItem {
    product: Product!
    quantity: Int!
    priceCents: Int!
  }

  type Order {
    id: ID!
    status: OrderStatus!
    "Sum of quantity × priceCents"
    totalCents: Int!
    customer: Customer!
    items: [OrderItem!]!
  }

  type Query {
    orders(status: OrderStatus, first: Int! = 10): [Order!]!
    order(id: ID!): Order
  }
`

const resolvers = {
  Query: {
    orders: (_parent: unknown, { status, first }: { status?: OrderStatus | null; first: number }) =>
      orders.filter((order) => !status || order.status === status).slice(0, first),
    order: (_parent: unknown, { id }: { id: string }) =>
      orders.find((order) => order.id === id) ?? null,
  },
  Order: {
    totalCents: (order: Order) =>
      order.items.reduce((sum, line) => sum + line.quantity * line.priceCents, 0),
    customer: (order: Order) => customers.find((customer) => customer.id === order.customerId),
  },
  OrderItem: {
    product: (line: OrderItem) => products.find((product) => product.id === line.productId),
  },
}

export const createApp = async () => {
  const server = new ApolloServer({ typeDefs, resolvers })
  await server.start()
  const app = express()
  app.use('/graphql', express.json(), expressMiddleware(server))
  return app
}
