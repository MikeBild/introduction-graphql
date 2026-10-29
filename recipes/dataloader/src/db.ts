import { log } from './logger.ts'

export type OrderRow = { id: string; total: number; customerId: string }
export type CustomerRow = { id: string; name: string }

const orderRows: OrderRow[] = [
  { id: 'o-1', total: 42, customerId: 'c-1' },
  { id: 'o-2', total: 17, customerId: 'c-2' },
  { id: 'o-3', total: 99, customerId: 'c-1' },
  { id: 'o-4', total: 5, customerId: 'c-3' },
  { id: 'o-5', total: 23, customerId: 'c-404' },
]

const customerRows: CustomerRow[] = [
  { id: 'c-1', name: 'Ada Lovelace' },
  { id: 'c-2', name: 'Grace Hopper' },
  { id: 'c-3', name: 'Alan Turing' },
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
  customers: {
    findById: (id: string) =>
      query(
        `SELECT * FROM customers WHERE id = '${id}'`,
        customerRows.find((row) => row.id === id) ?? null,
      ),
    // Like a real database: the rows come back in table order, not in the order of the ids.
    findByIds: (ids: readonly string[]) =>
      query(
        `SELECT * FROM customers WHERE id IN (${ids.map((id) => `'${id}'`).join(', ')})`,
        customerRows.filter((row) => ids.includes(row.id)),
      ),
    rename: (id: string, name: string) => {
      const row = customerRows.find((candidate) => candidate.id === id)
      if (row) row.name = name
      return query(`UPDATE customers SET name = '${name}' WHERE id = '${id}'`, row ?? null)
    },
  },
}
