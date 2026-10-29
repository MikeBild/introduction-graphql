import { graphql, useFragment, type FragmentType } from './gql'

// Each component declares the fields it renders – and gets only those.
export const StatusBadgeFragment = graphql(`
  fragment StatusBadge on Order {
    status
  }
`)

const labels = {
  DRAFT: 'draft',
  PLACED: 'placed',
  PAID: 'paid',
  SHIPPED: 'shipped',
  CANCELLED: 'cancelled',
} as const

export const StatusBadge = (props: { order: FragmentType<typeof StatusBadgeFragment> }) => {
  const { status } = useFragment(StatusBadgeFragment, props.order)
  return <small>{labels[status]}</small>
}
