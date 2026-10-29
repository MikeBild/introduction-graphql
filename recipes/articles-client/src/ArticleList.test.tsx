import { MockedProvider } from '@apollo/client/testing/react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { ArticleList, ArticlesQuery } from './ArticleList.tsx'

afterEach(cleanup)

const article = (id: string, title: string) => ({
  __typename: 'Article',
  id,
  title,
  state: 'DRAFT',
})

it('renders the articles once the query has answered', async () => {
  render(
    <MockedProvider
      mocks={[
        {
          request: { query: ArticlesQuery },
          result: { data: { articles: [article('ar-1', 'First'), article('ar-2', 'Second')] } },
        },
      ]}
    >
      <ArticleList />
    </MockedProvider>,
  )
  expect(await screen.findByText('First')).toBeTruthy()
  expect(screen.getAllByRole('listitem')).toHaveLength(2)
})

it('shows an empty list while loading and when the request fails – no loading or error state', async () => {
  const { container } = render(
    <MockedProvider
      mocks={[{ request: { query: ArticlesQuery }, error: new Error('Network down') }]}
    >
      <ArticleList />
    </MockedProvider>,
  )
  expect(container.innerHTML).toBe('<ul></ul>')
  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(container.innerHTML).toBe('<ul></ul>')
})
