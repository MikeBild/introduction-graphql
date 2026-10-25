import { GraphQLError } from 'graphql'
import { createSchema, createYoga, type YogaInitialContext } from 'graphql-yoga'
import { log, yogaLogger } from './logger.ts'
import { createOrder, customers, orders, stock, type Order } from './store.ts'

type PlaceOrderInput = { productId: string; quantity: number; street: string }

const typeDefs = /* GraphQL */ `
  type Customer {
    id: ID!
    name: String!
  }

  type Order {
    id: ID!
    productId: ID!
    quantity: Int!
    customer: Customer
  }

  input PlaceOrderInput {
    productId: ID!
    quantity: Int!
    street: String!
  }

  type Query {
    orders: [Order!]!
  }

  type Mutation {
    placeOrder(input: PlaceOrderInput!): Order!
  }
`

const requireUser = ({ request }: YogaInitialContext) => {
  const customerId = request.headers.get('authorization')
  if (!customerId)
    throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } })
  return customerId
}

export const yoga = createYoga({
  logging: yogaLogger,
  schema: createSchema<YogaInitialContext>({
    typeDefs,
    resolvers: {
      Query: { orders: () => orders },
      Mutation: {
        placeOrder: (
          _parent: unknown,
          { input }: { input: PlaceOrderInput },
          context: YogaInitialContext,
        ) => {
          const customerId = requireUser(context)
          // Expected business failures thrown as plain errors: Yoga masks them as "Unexpected error."
          if ((stock.get(input.productId) ?? 0) < input.quantity)
            throw new Error(`Product ${input.productId} is out of stock`)
          if (input.street.trim() === '') throw new Error('Street must not be empty')
          const order = createOrder({ ...input, customerId })
          log.info(`[orders] placed ${order.id} for ${customerId}`)
          return order
        },
      },
      Order: {
        customer: (order: Order) => {
          // Simulates an unreachable customer service for unknown customers.
          const customer = customers.get(order.customerId)
          if (!customer) throw new Error(`Customer service timeout for ${order.customerId}`)
          return customer
        },
      },
    },
  }),
})
