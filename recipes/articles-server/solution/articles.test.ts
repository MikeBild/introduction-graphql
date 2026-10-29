import { describe, expect, it } from 'vitest'
import { yoga } from './yoga.ts'

// Straight through yoga.fetch: no port, no network, the whole HTTP pipeline.
const post = async (query: string, variables = {}, headers: Record<string, string> = {}) => {
  const response = await yoga.fetch('http://test/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify({ query, variables }),
  })
  return { status: response.status, ...(await response.json()) }
}
const asAda = { authorization: 'Bearer token-ada' }

describe('queries', () => {
  it('answers articles, newest first', async () => {
    const result = await post(`query Articles { articles { id title } }`)
    expect(result.errors).toBeUndefined()
    expect(result.data.articles.map((article: { id: string }) => article.id)).toEqual([
      'ar-3',
      'ar-2',
      'ar-1',
    ])
  })

  it('answers author(id) with the articles of that author', async () => {
    const result = await post(`query { author(id: "a-2") { name articles { title } } }`)
    expect(result.data.author).toEqual({
      name: 'Grace Hopper',
      articles: [{ title: 'Compilers for everyone' }, { title: 'The first bug' }],
    })
  })

  it('goes from an article to its author', async () => {
    const result = await post(`query { article(id: "ar-1") { author { name } } }`)
    expect(result.data.article).toEqual({ author: { name: 'Ada Lovelace' } })
  })
})

describe('mutations', () => {
  it('articleAdd without a token answers UNAUTHENTICATED – status 200, data null', async () => {
    const result = await post(
      `mutation Add($input: ArticleAddInput!) { articleAdd(input: $input) { article { id } } }`,
      { input: { title: 'Anonymous', content: '…' } },
    )
    expect(result.status).toBe(200)
    expect(result.data).toBeNull()
    expect(result.errors[0].extensions.code).toBe('UNAUTHENTICATED')
  })

  it('articleAdd creates a draft for the signed-in author, articlePublish publishes it', async () => {
    const added = await post(
      `mutation Add($input: ArticleAddInput!) {
        articleAdd(input: $input) { article { id state author { id } } }
      }`,
      { input: { title: 'Poetical science', content: '…' } },
      asAda,
    )
    const article = added.data.articleAdd.article
    expect(article).toMatchObject({ state: 'DRAFT', author: { id: 'a-1' } })

    const published = await post(
      `mutation Publish($input: ArticlePublishInput!) {
        articlePublish(input: $input) { article { id state } }
      }`,
      { input: { articleId: article.id } },
      asAda,
    )
    expect(published.data.articlePublish.article).toEqual({ id: article.id, state: 'PUBLISHED' })
  })

  it('articlePublish of a foreign article answers FORBIDDEN', async () => {
    const result = await post(
      `mutation { articlePublish(input: { articleId: "ar-3" }) { article { id } } }`,
      {},
      asAda,
    )
    expect(result.errors[0].extensions.code).toBe('FORBIDDEN')
  })

  it('rejects variables without the required title before any resolver runs: status 400', async () => {
    const result = await post(
      `mutation Add($input: ArticleAddInput!) { articleAdd(input: $input) { article { id } } }`,
      { input: { content: '…' } },
      asAda,
    )
    expect(result.status).toBe(400)
    expect(result.errors[0].message).toMatch(/required field "title"/)
  })
})
