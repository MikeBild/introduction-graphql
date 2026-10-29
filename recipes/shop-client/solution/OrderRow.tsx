import { formatCents } from '../src/money.ts'
import { graphql, useFragment, type FragmentType } from './gql'
import { StatusBadge } from './StatusBadge.tsx'

export const OrderRowFragment = graphql(`
  fragment OrderRow on Order {
    id
    totalCents
    ...StatusBadge
  }
`)

export const OrderRow = (props: { order: FragmentType<typeof OrderRowFragment> }) => {
  const order = useFragment(OrderRowFragment, props.order)
  return (
    <li>
      {order.id} {formatCents(order.totalCents)} <StatusBadge order={order} />
    </li>
  )
}
