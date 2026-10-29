import { gql, type ApolloClient } from '@apollo/client'

export type OrdersData = { orders: { id: string; status: string }[] }
export type OrderDetailData = { order: { id: string; total: number; status: string } | null }

// The list view
export const OrdersQuery = gql`
  query Orders {
    orders {
      id
      status
    }
  }
`

// The detail view
export const OrderDetailQuery = gql`
  query OrderDetail($id: ID!) {
    order(id: $id) {
      id
      total
      status
    }
  }
`

// Asks only for the id back, so the cache learns nothing: both views need a refetch.
export const CancelOrderMutation = gql`
  mutation CancelOrder($input: CancelOrderInput!) {
    cancelOrder(input: $input) {
      order {
        id
      }
    }
  }
`

export const cancelOrder = (client: ApolloClient, orderId: string) =>
  client.mutate({
    mutation: CancelOrderMutation,
    variables: { input: { orderId } },
    refetchQueries: ['Orders', 'OrderDetail'],
    awaitRefetchQueries: true,
  })
