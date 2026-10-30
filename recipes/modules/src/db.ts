import { log } from './logger.ts'

export type OrderStatus = 'DRAFT' | 'PLACED' | 'PAID' | 'SHIPPED' | 'CANCELLED'
export type OrderItemRow = { productId: string; quantity: number; priceCents: number }
export type OrderRow = {
  id: string
  customerId: string
  status: OrderStatus
  items: OrderItemRow[]
}
export type ProductRow = { id: string; name: string; priceCents: number; stock: number }

const seedOrders: OrderRow[] = [
  {
    id: 'o-1',
    customerId: 'c-1',
    status: 'PLACED',
    items: [{ productId: 'p-1', quantity: 2, priceCents: 1290 }],
  },
  {
    id: 'o-2',
    customerId: 'c-2',
    status: 'DRAFT',
    items: [{ productId: 'p-2', quantity: 1, priceCents: 2490 }],
  },
  {
    id: 'o-3',
    customerId: 'c-1',
    status: 'DRAFT',
    items: [
      { productId: 'p-1', quantity: 1, priceCents: 1290 },
      { productId: 'p-3', quantity: 1, priceCents: 18900 },
    ],
  },
]

const productRows: ProductRow[] = [
  { id: 'p-1', name: 'Hammer', priceCents: 1290, stock: 10 },
  { id: 'p-2', name: 'Screwdriver set', priceCents: 2490, stock: 3 },
  { id: 'p-3', name: 'Workbench', priceCents: 18900, stock: 0 },
]

let orderRows = structuredClone(seedOrders)

const query = async <T>(sql: string, result: T): Promise<T> => {
  log.debug(`[db] ${sql}`)
  await new Promise((resolve) => setTimeout(resolve, 1))
  return structuredClone(result)
}

export const db = {
  // Tests start from the same rows.
  reset: () => {
    orderRows = structuredClone(seedOrders)
  },
  orders: {
    findByCustomer: (customerId: string) =>
      query(
        `SELECT * FROM orders WHERE customer_id = '${customerId}'`,
        orderRows.filter((row) => row.customerId === customerId),
      ),
    findById: (id: string) =>
      query(
        `SELECT * FROM orders WHERE id = '${id}'`,
        orderRows.find((row) => row.id === id) ?? null,
      ),
    saveItems: (id: string, items: OrderItemRow[]) => {
      orderRows = orderRows.map((row) => (row.id === id ? { ...row, items } : row))
      return query(
        `UPDATE orders SET items = ... WHERE id = '${id}'`,
        orderRows.find((row) => row.id === id) ?? null,
      )
    },
  },
  products: {
    findMany: () => query('SELECT * FROM products', productRows),
    // Like a real database: the rows come back in table order, not in the order of the ids.
    findByIds: (ids: readonly string[]) =>
      query(
        `SELECT * FROM products WHERE id IN (${ids.map((id) => `'${id}'`).join(', ')})`,
        productRows.filter((row) => ids.includes(row.id)),
      ),
  },
}
