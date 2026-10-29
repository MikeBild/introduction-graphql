import { readFileSync } from 'node:fs'
import { GraphQLError } from 'graphql'
import { createSchema, createYoga } from 'graphql-yoga'
import { addArticle, articles, verifyToken, type Author } from './data.ts'
import { yogaLogger } from './logger.ts'

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

export const yoga = createYoga({
  logging: yogaLogger,
  context: ({ request }): Context => ({ user: verifyToken(request.headers.get('authorization')) }),
  schema: createSchema<Context>({ typeDefs, resolvers }),
})
