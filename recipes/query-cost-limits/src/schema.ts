import { createSchema } from 'graphql-yoga'

type Customer = { id: string; name: string }
type Order = { id: string; status: 'OPEN' | 'PAID'; customerId: string }

const customers: Customer[] = Array.from({ length: 10 }, (_, index) => ({
  id: `c-${index}`,
  name: `Customer ${index}`,
}))
const orders: Order[] = Array.from({ length: 100 }, (_, index) => ({
  id: `o-${index}`,
  status: index % 2 ? 'PAID' : 'OPEN',
  customerId: `c-${index % 10}`,
}))

// Counts how many order objects the server had to produce – our stand-in for database load.
export const load = { resolvedOrders: 0 }
const takeOrders = (candidates: Order[], first: number) => {
  const page = candidates.slice(0, first)
  load.resolvedOrders += page.length
  return page
}

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Customer {
      id: ID!
      name: String!
      orders(first: Int! = 10): [Order!]!
    }

    type Order {
      id: ID!
      status: String!
      customer: Customer!
    }

    type Query {
      orders(first: Int! = 10): [Order!]!
    }
  `,
  resolvers: {
    Query: {
      orders: (_parent: unknown, { first }: { first: number }) => takeOrders(orders, first),
    },
    Order: {
      customer: (order: Order) => customers.find((customer) => customer.id === order.customerId),
    },
    Customer: {
      orders: (customer: Customer, { first }: { first: number }) =>
        takeOrders(
          orders.filter((order) => order.customerId === customer.id),
          first,
        ),
    },
  },
})
