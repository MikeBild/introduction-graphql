import { GraphQLError } from 'graphql'
import { createSchema, createYoga, type YogaInitialContext } from 'graphql-yoga'
import { log, yogaLogger } from '../src/logger.ts'
import { createOrder, customers, orders, stock, type Order } from '../src/store.ts'

type PlaceOrderInput = { productId: string; quantity: number; street: string }

type PlaceOrderResult =
  | { __typename: 'PlaceOrderSuccess'; order: Order }
  | { __typename: 'OutOfStock'; productId: string; message: string }
  | { __typename: 'InvalidAddress'; field: string; message: string }

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

  type PlaceOrderSuccess {
    order: Order!
  }

  type OutOfStock {
    productId: ID!
    message: String!
  }

  type InvalidAddress {
    field: String!
    message: String!
  }

  union PlaceOrderResult = PlaceOrderSuccess | OutOfStock | InvalidAddress

  type Query {
    orders: [Order!]!
  }

  type Mutation {
    placeOrder(input: PlaceOrderInput!): PlaceOrderResult!
  }
`

const requireUser = ({ request }: YogaInitialContext) => {
  const customerId = request.headers.get('authorization')
  if (!customerId)
    throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } })
  return customerId
}

// Expected business failures are values of the schema, not exceptions.
const placeOrder = (input: PlaceOrderInput, customerId: string): PlaceOrderResult => {
  if ((stock.get(input.productId) ?? 0) < input.quantity)
    return {
      __typename: 'OutOfStock',
      productId: input.productId,
      message: 'Not enough items in stock.',
    }
  if (input.street.trim() === '')
    return { __typename: 'InvalidAddress', field: 'street', message: 'Street must not be empty.' }
  const order = createOrder({ ...input, customerId })
  log.info(`[orders] placed ${order.id} for ${customerId}`)
  return { __typename: 'PlaceOrderSuccess', order }
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
        ) => placeOrder(input, requireUser(context)),
      },
      Order: {
        customer: (order: Order) => {
          const customer = customers.get(order.customerId)
          if (!customer) throw new Error(`Customer service timeout for ${order.customerId}`)
          return customer
        },
      },
    },
  }),
})
