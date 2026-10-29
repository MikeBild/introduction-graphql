import { useQuery } from '@apollo/client/react'
import { ArticleRow } from './ArticleRow.tsx'
import { graphql } from './gql'

// The page composes the fragments of its components into one query: one request, no waterfall.
export const ArticlesPageQuery = graphql(`
  query ArticlesPage {
    articles {
      id
      ...ArticleRow
    }
  }
`)

export const ArticleList = () => {
  const { data, loading, error } = useQuery(ArticlesPageQuery)
  if (loading) return <p role="status">Loading articles …</p>
  if (error) return <p role="alert">Could not load the articles: {error.message}</p>
  if (!data?.articles.length) return <p>No articles yet.</p>
  return (
    <ul>
      {data.articles.map((article) => (
        <ArticleRow key={article.id} article={article} />
      ))}
    </ul>
  )
}
