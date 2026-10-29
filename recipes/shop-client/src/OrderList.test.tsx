import { MockedProvider } from '@apollo/client/testing/react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { OrderList, OrdersQuery } from './OrderList.tsx'

afterEach(cleanup)

const order = (id: string, totalCents: number) => ({
  __typename: 'Order',
  id,
  status: 'PLACED',
  totalCents,
})

it('renders the orders once the query has answered', async () => {
  render(
    <MockedProvider
      mocks={[
        {
          request: { query: OrdersQuery },
          result: { data: { orders: [order('o-1', 2580), order('o-2', 2490)] } },
        },
      ]}
    >
      <OrderList />
    </MockedProvider>,
  )
  expect(await screen.findByText(/o-1/)).toBeTruthy()
  expect(screen.getAllByRole('listitem')).toHaveLength(2)
})

it('shows an empty list while loading and when the request fails – no loading or error state', async () => {
  const { container } = render(
    <MockedProvider mocks={[{ request: { query: OrdersQuery }, error: new Error('Network down') }]}>
      <OrderList />
    </MockedProvider>,
  )
  expect(container.innerHTML).toBe('<ul></ul>')
  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(container.innerHTML).toBe('<ul></ul>')
})
