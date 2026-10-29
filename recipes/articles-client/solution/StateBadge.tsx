import { graphql, useFragment, type FragmentType } from './gql'

// Each component declares the fields it renders – and gets only those.
export const StateBadgeFragment = graphql(`
  fragment StateBadge on Article {
    state
  }
`)

export const StateBadge = (props: { article: FragmentType<typeof StateBadgeFragment> }) => {
  const { state } = useFragment(StateBadgeFragment, props.article)
  return <small>{state === 'PUBLISHED' ? 'published' : 'draft'}</small>
}
