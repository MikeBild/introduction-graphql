import { MockedProvider } from '@apollo/client/testing/react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { ArticleList, ArticlesPageQuery } from './ArticleList.tsx'

afterEach(cleanup)

const article = (id: string, title: string, state: 'DRAFT' | 'PUBLISHED') => ({
  __typename: 'Article' as const,
  id,
  title,
  state,
})

it('renders one row per article, each through its own fragment', async () => {
  render(
    <MockedProvider
      mocks={[
        {
          request: { query: ArticlesPageQuery },
          result: {
            data: {
              articles: [article('ar-1', 'First', 'PUBLISHED'), article('ar-2', 'Second', 'DRAFT')],
            },
          },
        },
      ]}
    >
      <ArticleList />
    </MockedProvider>,
  )
  expect(screen.getByRole('status').textContent).toMatch(/Loading/)
  expect(await screen.findByText('First')).toBeTruthy()
  expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
    'First published',
    'Second draft',
  ])
})

it('renders the error state', async () => {
  render(
    <MockedProvider
      mocks={[{ request: { query: ArticlesPageQuery }, error: new Error('Network down') }]}
    >
      <ArticleList />
    </MockedProvider>,
  )
  expect((await screen.findByRole('alert')).textContent).toMatch(/Network down/)
})

it('renders an empty state', async () => {
  render(
    <MockedProvider
      mocks={[{ request: { query: ArticlesPageQuery }, result: { data: { articles: [] } } }]}
    >
      <ArticleList />
    </MockedProvider>,
  )
  expect(await screen.findByText('No articles yet.')).toBeTruthy()
})
