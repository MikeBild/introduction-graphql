import { beforeEach, expect, it } from 'vitest'
import { db } from '../../../src/db.ts'
import { removeOrderItem } from './logic.ts'

beforeEach(() => db.reset())

const ada = { id: 'c-1' }

// No server, no schema, no resolver: the rule runs on its own.
it('removes an item while the order is DRAFT', async () => {
  const result = await removeOrderItem(ada, { orderId: 'o-3', productId: 'p-3' })
  expect(result.ok && result.order.items.map((item) => item.productId)).toEqual(['p-1'])
})

it('refuses to change an order from PLACED on', async () => {
  const result = await removeOrderItem(ada, { orderId: 'o-1', productId: 'p-1' })
  expect(result).toMatchObject({ ok: false, reason: 'NOT_EDITABLE' })
  expect((await db.orders.findById('o-1'))?.items).toHaveLength(1)
})

it('treats a foreign order like a missing one', async () => {
  const result = await removeOrderItem(ada, { orderId: 'o-2', productId: 'p-2' })
  expect(result).toEqual({ ok: false, reason: 'NOT_FOUND', orderId: 'o-2' })
})
