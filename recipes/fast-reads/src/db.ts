import { Database } from 'node:sqlite'
import { setTimeout as sleep } from 'node:timers/promises'
import { log } from './logger.ts'

export type OrderRow = { id: string; status: string; created_at: string }
export type OrderItemRow = {
  order_id: string
  product_id: string
  quantity: number
  price_cents: number
}
export type ProductRow = { id: string; name: string; price_cents: number }

const schema = `
  create table if not exists products (
    id text primary key,
    name text not null,
    price_cents integer not null
  ) strict;
  create table if not exists orders (
    id text primary key,
    status text not null,
    created_at text not null
  ) strict;
  create table if not exists order_items (
    order_id text not null references orders (id),
    product_id text not null,
    quantity integer not null,
    price_cents integer not null,
    primary key (order_id, product_id)
  ) strict;
  create index if not exists orders_newest_idx on orders (created_at, id);
`

// SQLite is a function call away. This stands in for the network to a database server:
// each query holds one of ten connections for one round trip. 0 turns it off.
const createRoundTrip = (milliseconds: number, connections = 10) => {
  let free = connections
  const waiting: (() => void)[] = []
  return async () => {
    if (milliseconds === 0) return
    if (free === 0) await new Promise<void>((resolve) => waiting.push(resolve))
    else free -= 1
    await sleep(milliseconds)
    const next = waiting.shift()
    if (next) next()
    else free += 1
  }
}

export type DbOptions = { roundTripMs?: number }

export const createDb = (
  path: string,
  { roundTripMs = Number(process.env.DB_ROUND_TRIP_MS ?? 0) }: DbOptions = {},
) => {
  const database = new Database(path)
  database.exec('pragma journal_mode = wal')
  database.exec(schema)
  const roundTrip = createRoundTrip(roundTripMs)

  // Every call counts as one access to the database, prepared once, whatever the variant.
  let queries = 0
  const statement = <Row>(sql: string) => {
    const prepared = database.prepare(sql)
    return async (...params: (string | number)[]) => {
      queries += 1
      log.debug(`[db] #${queries} ${sql.trim()}`, params)
      await roundTrip()
      return prepared.all(...params) as Row[]
    }
  }

  const ordersPage = statement<OrderRow>(`
    select id, status, created_at from orders
    order by created_at desc, id desc limit ? offset ?
  `)
  const itemsOfOrder = statement<OrderItemRow>(`
    select order_id, product_id, quantity, price_cents from order_items where order_id = ?
  `)
  const productById = statement<ProductRow>(`
    select id, name, price_cents from products where id = ?
  `)
  const insertOrder = database.prepare(`
    insert into orders (id, status, created_at) values (?, ?, ?)
  `)

  return {
    database,
    statement,
    queries: () => queries,
    resetQueries: () => {
      queries = 0
    },
    orders: {
      page: (limit: number, offset: number) => ordersPage(limit, offset),
      insert: ({ id, status, created_at }: OrderRow) => {
        insertOrder.run(id, status, created_at)
      },
    },
    items: {
      ofOrder: (orderId: string) => itemsOfOrder(orderId),
    },
    products: {
      findById: async (id: string) => (await productById(id))[0] ?? null,
    },
  }
}

export type Db = ReturnType<typeof createDb>
