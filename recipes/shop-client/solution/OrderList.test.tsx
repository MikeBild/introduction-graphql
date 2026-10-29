import { MockedProvider } from '@apollo/client/testing/react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { ORDERS_PAGE, OrderList } from './OrderList.tsx'

afterEach(cleanup)

const order = (id: string, totalCents: number, status: 'PLACED') => ({
  __typename: 'Order' as const,
  id,
  totalCents,
  status,
})

it('renders one row per order, each read through useFragment from the cache', async () => {
  render(
    <MockedProvider
      mocks={[
        {
          request: { query: ORDERS_PAGE, variables: { status: 'PLACED' } },
          result: {
            data: { orders: [order('o-1', 2580, 'PLACED'), order('o-2', 2490, 'PLACED')] },
          },
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
  ).toEqual(['o-1 25,80 € placed', 'o-2 24,90 € placed'])
})

it('renders the error state', async () => {
  render(
    <MockedProvider
      mocks={[
        {
          request: { query: ORDERS_PAGE, variables: { status: 'PLACED' } },
          error: new Error('Network down'),
        },
      ]}
    >
      <OrderList />
    </MockedProvider>,
  )
  expect((await screen.findByRole('alert')).textContent).toMatch(/Network down/)
})

it('renders an empty state', async () => {
  render(
    <MockedProvider
      mocks={[
        {
          request: { query: ORDERS_PAGE, variables: { status: 'PLACED' } },
          result: { data: { orders: [] } },
        },
      ]}
    >
      <OrderList />
    </MockedProvider>,
  )
  expect(await screen.findByText('No open orders.')).toBeTruthy()
})
