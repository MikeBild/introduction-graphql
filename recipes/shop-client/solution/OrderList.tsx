import { useQuery } from '@apollo/client/react'
import { graphql } from './gql'
import { OrderRow } from './OrderRow.tsx'

// The page composes the fragments of its components into one query: one request, no waterfall.
export const OrdersPageQuery = graphql(`
  query OrdersPage {
    orders {
      id
      ...OrderRow
    }
  }
`)

export const OrderList = () => {
  const { data, loading, error } = useQuery(OrdersPageQuery)
  if (loading) return <p role="status">Loading orders …</p>
  if (error) return <p role="alert">Could not load the orders: {error.message}</p>
  if (!data?.orders.length) return <p>No orders yet.</p>
  return (
    <ul>
      {data.orders.map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}
    </ul>
  )
}
