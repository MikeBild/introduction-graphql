import { describe, expect, it } from 'vitest'
import { cancel, place, removeItem, totalCents, type Order, type OrderStatus } from './order.ts'

const draft: Order = {
  id: 'o-1',
  customerId: 'c-1',
  status: 'DRAFT',
  items: [
    { productId: 'p-1', quantity: 2, priceCents: 1290 },
    { productId: 'p-3', quantity: 1, priceCents: 390 },
  ],
}

it('adds up the total from quantity and price', () => {
  expect(totalCents(draft)).toBe(2970)
})

it('places a draft order', () => {
  expect(place(draft)).toEqual({ ...draft, status: 'PLACED' })
})

it('rejects placing an order without items', () => {
  expect(place({ ...draft, items: [] })).toMatchObject({ rejected: 'EmptyOrder' })
})

describe('cancel', () => {
  it.each<OrderStatus>(['DRAFT', 'PLACED'])('cancels an order in status %s', (status) => {
    expect(cancel({ ...draft, status })).toMatchObject({ status: 'CANCELLED' })
  })

  it.each<OrderStatus>(['PAID', 'SHIPPED', 'CANCELLED'])(
    'rejects cancelling an order in status %s',
    (status) => {
      expect(cancel({ ...draft, status })).toMatchObject({ rejected: 'OrderNotCancellable' })
    },
  )
})

describe('removeItem', () => {
  it('removes the item from a draft order', () => {
    expect(removeItem('p-1')(draft)).toMatchObject({ items: [draft.items[1]] })
  })

  it.each<OrderStatus>(['PLACED', 'PAID', 'SHIPPED', 'CANCELLED'])(
    'rejects removing an item in status %s',
    (status) => {
      expect(removeItem('p-1')({ ...draft, status })).toMatchObject({
        rejected: 'OrderNotEditable',
      })
    },
  )

  it('leaves the order untouched when it rejects', () => {
    const placed: Order = { ...draft, status: 'PLACED' }
    removeItem('p-1')(placed)
    expect(placed.items).toHaveLength(2)
  })
})
