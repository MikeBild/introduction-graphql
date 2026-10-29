import { graphql, useFragment, type FragmentType } from './gql'
import { StateBadge } from './StateBadge.tsx'

export const ArticleRowFragment = graphql(`
  fragment ArticleRow on Article {
    id
    title
    ...StateBadge
  }
`)

export const ArticleRow = (props: { article: FragmentType<typeof ArticleRowFragment> }) => {
  const article = useFragment(ArticleRowFragment, props.article)
  return (
    <li>
      {article.title} <StateBadge article={article} />
    </li>
  )
}
