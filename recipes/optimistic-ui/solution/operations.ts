import { gql, type ApolloClient } from '@apollo/client'

export { OrderDetailQuery, OrdersQuery } from '../src/operations.ts'
export type { OrderDetailData, OrdersData } from '../src/operations.ts'

// The payload returns the changed object with id and status: the normalized cache
// updates Order:o-1 and with it every view that shows this order.
export const CancelOrderMutation = gql`
  mutation CancelOrder($input: CancelOrderInput!) {
    cancelOrder(input: $input) {
      order {
        id
        status
      }
    }
  }
`

export const cancelOrder = (client: ApolloClient, orderId: string) =>
  client.mutate({
    mutation: CancelOrderMutation,
    variables: { input: { orderId } },
    // Written to the cache at once, replaced by the server response, rolled back on error.
    optimisticResponse: {
      cancelOrder: {
        __typename: 'CancelOrderPayload',
        order: { __typename: 'Order', id: orderId, status: 'CANCELLED' },
      },
    },
  })
