import { MockedProvider } from '@apollo/client/testing/react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { OrderList, OrdersPageQuery } from './OrderList.tsx'

afterEach(cleanup)

const order = (id: string, totalCents: number, status: 'PLACED' | 'PAID') => ({
  __typename: 'Order' as const,
  id,
  totalCents,
  status,
})

it('renders one row per order, each through its own fragment', async () => {
  render(
    <MockedProvider
      mocks={[
        {
          request: { query: OrdersPageQuery },
          result: { data: { orders: [order('o-1', 2580, 'PLACED'), order('o-2', 2490, 'PAID')] } },
        },
      ]}
    >
      <OrderList />
    </MockedProvider>,
  )
  expect(screen.getByRole('status').textContent).toMatch(/Loading/)
  expect(await screen.findByText(/o-1/)).toBeTruthy()
  // Intl puts a non-breaking space before the euro sign.
  expect(
    screen.getAllByRole('listitem').map((item) => item.textContent?.replace(/\s+/g, ' ')),
  ).toEqual(['o-1 25,80 € placed', 'o-2 24,90 € paid'])
})

it('renders the error state', async () => {
  render(
    <MockedProvider
      mocks={[{ request: { query: OrdersPageQuery }, error: new Error('Network down') }]}
    >
      <OrderList />
    </MockedProvider>,
  )
  expect((await screen.findByRole('alert')).textContent).toMatch(/Network down/)
})

it('renders an empty state', async () => {
  render(
    <MockedProvider
      mocks={[{ request: { query: OrdersPageQuery }, result: { data: { orders: [] } } }]}
    >
      <OrderList />
    </MockedProvider>,
  )
  expect(await screen.findByText('No orders yet.')).toBeTruthy()
})
