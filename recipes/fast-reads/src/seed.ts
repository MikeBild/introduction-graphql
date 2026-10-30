import { rmSync } from 'node:fs'
import type { Database } from 'node:sqlite'
import { createDb } from './db.ts'
import { log } from './logger.ts'

export const databasePath = process.env.DB_PATH ?? 'shop.db'

const names = ['Hammer', 'Screwdriver set', 'Workbench', 'Pliers', 'Spirit level', 'Saw']
const statuses = ['DRAFT', 'PLACED', 'PAID', 'SHIPPED', 'CANCELLED']

// Deterministic: the same arguments give the same file, so two runs measure the same data.
// Three orders share each second, so sorting needs the id to break ties.
export const seed = (database: Database, { orders = 50_000, products = 1_000 } = {}) => {
  const insertProduct = database.prepare('insert into products values (?, ?, ?)')
  const insertOrder = database.prepare('insert into orders values (?, ?, ?)')
  const insertItem = database.prepare('insert into order_items values (?, ?, ?, ?)')
  const priceOf = (product: number) => 990 + (product % 200) * 50
  const start = Date.UTC(2026, 0, 1)

  database.exec('begin')
  for (let product = 0; product < products; product += 1) {
    insertProduct.run(
      `p-${product}`,
      `${names[product % names.length]} ${product}`,
      priceOf(product),
    )
  }
  for (let order = 0; order < orders; order += 1) {
    const id = `o-${order}`
    const createdAt = new Date(start + Math.floor(order / 3) * 1000).toISOString()
    insertOrder.run(id, statuses[order % statuses.length], createdAt)
    for (let line = 0; line <= order % 3; line += 1) {
      const product = (order * 7 + line * 13) % products
      insertItem.run(id, `p-${product}`, 1 + (order % 4), priceOf(product))
    }
  }
  database.exec('commit')
  database.exec('analyze')
}

if (import.meta.main) {
  rmSync(databasePath, { force: true })
  rmSync(`${databasePath}-wal`, { force: true })
  rmSync(`${databasePath}-shm`, { force: true })
  const { database } = createDb(databasePath, { roundTripMs: 0 })
  const startedAt = performance.now()
  seed(database)
  database.exec('pragma wal_checkpoint(truncate)')
  database.close()
  log.info(`[seed] ${databasePath} ready in ${Math.round(performance.now() - startedAt)} ms`)
}
