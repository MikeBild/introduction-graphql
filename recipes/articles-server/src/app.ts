import { readFileSync } from 'node:fs'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { GraphQLError } from 'graphql'
import { addArticle, articles, verifyToken, type Author } from './data.ts'

export type Context = { user: Author | null }

// The schema lives in its own file: SDL first, resolvers second.
const typeDefs = readFileSync(new URL('./schema.graphql', import.meta.url), 'utf8')

const requireUser = (user: Author | null) => {
  if (!user)
    throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } })
  return user
}

const resolvers = {
  Query: {
    // TODO: answer Query.articles – right now nothing resolves it.
    article: (_parent: unknown, { id }: { id: string }) =>
      articles.find((article) => article.id === id) ?? null,
  },
  Mutation: {
    articleAdd: (
      _parent: unknown,
      { input }: { input: { title: string; content: string } },
      { user }: Context,
    ) => ({ article: addArticle(input, requireUser(user).id) }),
  },
}

export const createApp = async () => {
  const server = new ApolloServer<Context>({ typeDefs, resolvers })
  await server.start()
  const app = express()
  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<Context> => ({
        user: verifyToken(req.headers.authorization ?? null),
      }),
    }),
  )
  return app
}
