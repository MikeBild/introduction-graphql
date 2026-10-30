import type { Cursor } from '../src/cursor.ts'
import {
  createDb,
  type DbOptions,
  type OrderItemRow,
  type OrderRow,
  type ProductRow,
} from '../src/db.ts'

export const createFastDb = (path: string, options?: DbOptions) => {
  const db = createDb(path, options)

  // json_each: one prepared statement for any number of ids
  const itemsOfOrders = db.statement<OrderItemRow>(`
    select order_id, product_id, quantity, price_cents from order_items
    where order_id in (select value from json_each(?))
  `)
  const productsByIds = db.statement<ProductRow>(`
    select id, name, price_cents from products where id in (select value from json_each(?))
  `)
  const newestOrders = db.statement<OrderRow>(`
    select id, status, created_at from orders
    order by created_at desc, id desc limit ?
  `)
  // Row values: the same order as the index, so the database starts right at the cursor.
  const ordersBefore = db.statement<OrderRow>(`
    select id, status, created_at from orders
    where (created_at, id) < (?, ?)
    order by created_at desc, id desc limit ?
  `)

  return {
    ...db,
    orders: {
      ...db.orders,
      after: (cursor: Cursor | null, limit: number) =>
        cursor ? ordersBefore(cursor.createdAt, cursor.id, limit) : newestOrders(limit),
    },
    items: {
      ...db.items,
      ofOrders: (orderIds: readonly string[]) => itemsOfOrders(JSON.stringify(orderIds)),
    },
    products: {
      ...db.products,
      findByIds: (ids: readonly string[]) => productsByIds(JSON.stringify(ids)),
    },
  }
}

export type FastDb = ReturnType<typeof createFastDb>
