import { gql, type TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import type { OrdersPageQuery, OrdersPageQueryVariables } from './__generated__/graphql.ts'
import { ORDER_ROW, OrderRow } from './OrderRow.tsx'

// The page composes the fragment of its rows into one query: one request, no waterfall.
export const ORDERS_PAGE: TypedDocumentNode<OrdersPageQuery, OrdersPageQueryVariables> = gql`
  query OrdersPage($status: OrderStatus) {
    orders(status: $status) {
      id
      ...OrderRow
    }
  }
  ${ORDER_ROW}
`

// The open orders of the workshop shop
export const OrderList = () => {
  const { data, loading, error } = useQuery(ORDERS_PAGE, { variables: { status: 'PLACED' } })
  if (loading) return <p role="status">Loading orders …</p>
  if (error) return <p role="alert">Could not load the orders: {error.message}</p>
  if (!data?.orders.length) return <p>No open orders.</p>
  return (
    <ul>
      {data.orders.map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}
    </ul>
  )
}
