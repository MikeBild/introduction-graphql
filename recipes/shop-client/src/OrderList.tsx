import { gql, type TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { formatCents } from './money.ts'

// Written by hand: nothing checks that these types match the query or the schema.
type OrdersPageData = { orders: { id: string; status: string; totalCents: number }[] }
type OrdersPageVariables = { status?: string }

// One query for the whole page, the rows take whatever it returns.
export const ORDERS_PAGE: TypedDocumentNode<OrdersPageData, OrdersPageVariables> = gql`
  query OrdersPage($status: OrderStatus) {
    orders(status: $status) {
      id
      status
      totalCents
    }
  }
`

// The open orders of the workshop shop
export const OrderList = () => {
  const { data } = useQuery(ORDERS_PAGE, { variables: { status: 'PLACED' } })
  return (
    <ul>
      {data?.orders.map((order) => (
        <li key={order.id}>
          {order.id} {formatCents(order.totalCents)} <small>{order.status}</small>
        </li>
      ))}
    </ul>
  )
}
