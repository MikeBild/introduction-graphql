export type ArticleState = 'DRAFT' | 'PUBLISHED'
export type Author = { id: string; name: string }
export type Article = {
  id: string
  title: string
  content: string
  state: ArticleState
  authorId: string
  createdAt: string
}

export const authors: Author[] = [
  { id: 'a-1', name: 'Ada Lovelace' },
  { id: 'a-2', name: 'Grace Hopper' },
]

export const articles: Article[] = [
  {
    id: 'ar-1',
    title: 'Notes on the Analytical Engine',
    content: 'The engine weaves algebraic patterns.',
    state: 'PUBLISHED',
    authorId: 'a-1',
    createdAt: '2026-10-01T09:00:00.000Z',
  },
  {
    id: 'ar-2',
    title: 'The first bug',
    content: 'A moth in relay 70.',
    state: 'PUBLISHED',
    authorId: 'a-2',
    createdAt: '2026-10-02T09:00:00.000Z',
  },
  {
    id: 'ar-3',
    title: 'Compilers for everyone',
    content: 'Draft: why programs should read like English.',
    state: 'DRAFT',
    authorId: 'a-2',
    createdAt: '2026-10-03T09:00:00.000Z',
  },
]

export const addArticle = (input: { title: string; content: string }, authorId: string) => {
  const article: Article = {
    id: `ar-${articles.length + 1}`,
    ...input,
    state: 'DRAFT',
    authorId,
    createdAt: new Date().toISOString(),
  }
  articles.push(article)
  return article
}

// Stands in for JWT or session verification: maps a bearer token to an author, or null.
const tokens = new Map([
  ['token-ada', 'a-1'],
  ['token-grace', 'a-2'],
])

export const verifyToken = (authorization: string | null): Author | null => {
  const authorId = tokens.get(authorization?.replace(/^Bearer /, '') ?? '')
  return authors.find((author) => author.id === authorId) ?? null
}
