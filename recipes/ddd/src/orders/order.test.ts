import { expect, it } from 'vitest'
import { place, totalCents, type Order } from './order.ts'

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

// Your turn: a rule of the aggregate needs a test that breaks it.
it.todo('cancels from DRAFT and PLACED, nothing else')
it.todo('rejects removing an item once the order is placed')
it.todo('leaves the order untouched when it rejects')
