import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

// Written by hand: nothing checks that this type matches the query or the schema.
type ArticlesData = { articles: { id: string; title: string; state: string }[] }

// One query for the whole page, the rows take whatever it returns.
export const ArticlesQuery = gql`
  query Articles {
    articles {
      id
      title
      state
    }
  }
`

export const ArticleList = () => {
  const { data } = useQuery<ArticlesData>(ArticlesQuery)
  return (
    <ul>
      {data?.articles.map((article) => (
        <li key={article.id}>
          {article.title} <small>{article.state}</small>
        </li>
      ))}
    </ul>
  )
}
