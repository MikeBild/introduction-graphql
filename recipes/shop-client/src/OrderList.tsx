import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { formatCents } from './money.ts'

// Written by hand: nothing checks that this type matches the query or the schema.
type OrdersData = { orders: { id: string; status: string; totalCents: number }[] }

// One query for the whole page, the rows take whatever it returns.
export const OrdersQuery = gql`
  query Orders {
    orders {
      id
      status
      totalCents
    }
  }
`

export const OrderList = () => {
  const { data } = useQuery<OrdersData>(OrdersQuery)
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
