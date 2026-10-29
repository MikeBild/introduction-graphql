import { readFileSync } from 'node:fs'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import express from 'express'
import { GraphQLError } from 'graphql'
import {
  addArticle,
  articles,
  authors,
  verifyToken,
  type Article,
  type Author,
} from '../src/data.ts'

export type Context = { user: Author | null }

const typeDefs = readFileSync(new URL('./schema.graphql', import.meta.url), 'utf8')

const requireUser = (user: Author | null) => {
  if (!user)
    throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } })
  return user
}

const findArticle = (id: string) => articles.find((article) => article.id === id)
const newestFirst = (a: Article, b: Article) => b.createdAt.localeCompare(a.createdAt)

const resolvers = {
  Query: {
    articles: () => articles.toSorted(newestFirst),
    article: (_parent: unknown, { id }: { id: string }) => findArticle(id) ?? null,
    author: (_parent: unknown, { id }: { id: string }) =>
      authors.find((author) => author.id === id) ?? null,
  },
  Mutation: {
    articleAdd: (
      _parent: unknown,
      { input }: { input: { title: string; content: string } },
      { user }: Context,
    ) => ({ article: addArticle(input, requireUser(user).id) }),
    articlePublish: (
      _parent: unknown,
      { input }: { input: { articleId: string } },
      { user }: Context,
    ) => {
      const author = requireUser(user)
      const article = findArticle(input.articleId)
      if (!article)
        throw new GraphQLError('Article not found', { extensions: { code: 'NOT_FOUND' } })
      if (article.authorId !== author.id)
        throw new GraphQLError('Only the author may publish', {
          extensions: { code: 'FORBIDDEN' },
        })
      article.state = 'PUBLISHED'
      return { article }
    },
  },
  Article: {
    author: (article: Article) => authors.find((author) => author.id === article.authorId),
  },
  Author: {
    articles: (author: Author) =>
      articles.filter((article) => article.authorId === author.id).toSorted(newestFirst),
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
