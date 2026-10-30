import { log } from './logger.ts'

export type OrderStatus = 'DRAFT' | 'PLACED' | 'PAID' | 'SHIPPED' | 'CANCELLED'
export type Role = 'CUSTOMER' | 'SUPPORT'
export type UserRow = { id: string; name: string; roles: readonly Role[] }
export type OrderItemRow = { productId: string; quantity: number; priceCents: number }
export type OrderRow = {
  id: string
  customerId: string
  status: OrderStatus
  items: OrderItemRow[]
}
export type ProductRow = { id: string; name: string }

const userRows: UserRow[] = [
  { id: 'c-1', name: 'Ada', roles: ['CUSTOMER'] },
  { id: 'c-2', name: 'Grace', roles: ['CUSTOMER'] },
  { id: 's-1', name: 'Linus', roles: ['SUPPORT'] },
]

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
    status: 'PAID',
    items: [{ productId: 'p-2', quantity: 1, priceCents: 2490 }],
  },
  {
    id: 'o-3',
    customerId: 'c-1',
    status: 'SHIPPED',
    items: [{ productId: 'p-3', quantity: 1, priceCents: 18900 }],
  },
  {
    id: 'o-4',
    customerId: 'c-2',
    status: 'DRAFT',
    items: [{ productId: 'p-1', quantity: 1, priceCents: 1290 }],
  },
]

const productRows: ProductRow[] = [
  { id: 'p-1', name: 'Hammer' },
  { id: 'p-2', name: 'Screwdriver set' },
  { id: 'p-3', name: 'Workbench' },
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
  users: {
    findById: (id: string) =>
      query(
        `SELECT * FROM users WHERE id = '${id}'`,
        userRows.find((row) => row.id === id) ?? null,
      ),
  },
  orders: {
    findMany: () => query('SELECT * FROM orders', orderRows),
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
    updateStatus: (id: string, status: OrderStatus) => {
      orderRows = orderRows.map((row) => (row.id === id ? { ...row, status } : row))
      return query(
        `UPDATE orders SET status = '${status}' WHERE id = '${id}'`,
        orderRows.find((row) => row.id === id) ?? null,
      )
    },
  },
  products: {
    // Like a real database: the rows come back in table order, not in the order of the ids.
    findByIds: (ids: readonly string[]) =>
      query(
        `SELECT * FROM products WHERE id IN (${ids.map((id) => `'${id}'`).join(', ')})`,
        productRows.filter((row) => ids.includes(row.id)),
      ),
  },
}
