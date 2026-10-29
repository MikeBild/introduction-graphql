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

const orderRows: OrderRow[] = [
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
    status: 'DRAFT',
    items: [
      { productId: 'p-1', quantity: 1, priceCents: 1290 },
      { productId: 'p-3', quantity: 1, priceCents: 18900 },
    ],
  },
  {
    id: 'o-4',
    customerId: 'c-2',
    status: 'SHIPPED',
    items: [{ productId: 'p-404', quantity: 1, priceCents: 990 }],
  },
]

const productRows: ProductRow[] = [
  { id: 'p-1', name: 'Hammer', priceCents: 1290, stock: 10 },
  { id: 'p-2', name: 'Screwdriver set', priceCents: 2490, stock: 3 },
  { id: 'p-3', name: 'Workbench', priceCents: 18900, stock: 0 },
]

// Every call counts as one round trip to the database.
let queries = 0
const query = async <T>(sql: string, result: T): Promise<T> => {
  queries += 1
  log.debug(`[db] #${queries} ${sql}`)
  await new Promise((resolve) => setTimeout(resolve, 1))
  return structuredClone(result)
}

export const db = {
  queries: () => queries,
  resetQueries: () => {
    queries = 0
  },
  orders: {
    findMany: () => query('SELECT * FROM orders', orderRows),
  },
  products: {
    findById: (id: string) =>
      query(
        `SELECT * FROM products WHERE id = '${id}'`,
        productRows.find((row) => row.id === id) ?? null,
      ),
    // Like a real database: the rows come back in table order, not in the order of the ids.
    findByIds: (ids: readonly string[]) =>
      query(
        `SELECT * FROM products WHERE id IN (${ids.map((id) => `'${id}'`).join(', ')})`,
        productRows.filter((row) => ids.includes(row.id)),
      ),
    rename: (id: string, name: string) => {
      const row = productRows.find((candidate) => candidate.id === id)
      if (row) row.name = name
      return query(`UPDATE products SET name = '${name}' WHERE id = '${id}'`, row ?? null)
    },
  },
}
