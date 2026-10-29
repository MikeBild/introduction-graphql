import { gql, type TypedDocumentNode } from '@apollo/client'
import { useFragment } from '@apollo/client/react'
import { formatCents } from '../src/money.ts'
import type { OrderRowFragment } from './__generated__/graphql.ts'

// The row declares the fields it renders. useFragment reads them from the normalized cache.
export const ORDER_ROW: TypedDocumentNode<OrderRowFragment> = gql`
  fragment OrderRow on Order {
    id
    status
    totalCents
  }
`

const labels = {
  DRAFT: 'draft',
  PLACED: 'placed',
  PAID: 'paid',
  SHIPPED: 'shipped',
  CANCELLED: 'cancelled',
} as const

export const OrderRow = ({ order }: { order: { __typename: 'Order'; id: string } }) => {
  const { data, complete } = useFragment({ fragment: ORDER_ROW, from: order })
  if (!complete) return null
  return (
    <li>
      {data.id} {formatCents(data.totalCents)} <small>{labels[data.status]}</small>
    </li>
  )
}
