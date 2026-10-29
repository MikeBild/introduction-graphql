import { GraphQLError } from 'graphql'
import { createSchema, createYoga } from 'graphql-yoga'
import { yogaLogger } from '../src/logger.ts'
import { createStore, type Order, type Store } from '../src/store.ts'

const MAX_FIRST = 100

const typeDefs = /* GraphQL */ `
  type Order {
    id: ID!
    total: Float!
    createdAt: String!
  }

  type OrderConnection {
    edges: [OrderEdge!]!
    pageInfo: PageInfo!
  }

  type OrderEdge {
    node: Order!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type Query {
    "Newest first. Pass pageInfo.endCursor as after to get the next page. first is capped at ${MAX_FIRST}."
    orders(first: Int = 20, after: String): OrderConnection!
  }
`

// Opaque for clients: they only hand the cursor back. Internally it is the order id.
export const encodeCursor = (id: string) => Buffer.from(`Order:${id}`).toString('base64url')
const decodeCursor = (cursor: string) => {
  const [type, id] = Buffer.from(cursor, 'base64url').toString().split(':')
  if (type !== 'Order' || !id)
    throw new GraphQLError('Invalid cursor', { extensions: { code: 'BAD_USER_INPUT' } })
  return id
}

// Keyset: everything after the row with this id – stable, however many rows arrive on top.
const ordersAfter = (store: Store, afterId: string | null, limit: number): Order[] => {
  const rows = store.list()
  const start = afterId === null ? 0 : rows.findIndex((row) => row.id === afterId) + 1
  if (afterId !== null && start === 0)
    throw new GraphQLError('Cursor no longer valid', { extensions: { code: 'BAD_USER_INPUT' } })
  return rows.slice(start, start + limit)
}

export const createApp = (store: Store = createStore()) =>
  createYoga({
    logging: yogaLogger,
    schema: createSchema({
      typeDefs,
      resolvers: {
        Query: {
          orders: (
            _parent: unknown,
            { first, after }: { first: number; after?: string | null },
          ) => {
            if (first < 0)
              throw new GraphQLError('first must not be negative', {
                extensions: { code: 'BAD_USER_INPUT' },
              })
            const limit = Math.min(first, MAX_FIRST)
            // One row more than asked: if it exists, there is a next page.
            const rows = ordersAfter(store, after ? decodeCursor(after) : null, limit + 1)
            const edges = rows
              .slice(0, limit)
              .map((node) => ({ node, cursor: encodeCursor(node.id) }))
            return {
              edges,
              pageInfo: {
                hasNextPage: rows.length > limit,
                hasPreviousPage: Boolean(after),
                startCursor: edges.at(0)?.cursor ?? null,
                endCursor: edges.at(-1)?.cursor ?? null,
              },
            }
          },
        },
      },
    }),
  })

export const yoga = createApp()
