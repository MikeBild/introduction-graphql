# Fast reads: measure first

The orders of the workshop shop, newest first, on a real SQLite file with 50,000 orders (`npm run seed`). The server starts from the state of `shop-server`, with one thing missing: speed. `src/app.ts` runs one query per order, a second one per order for `totalCents` and one per line item. `Query.orders` pages with `OFFSET`, so the database walks past every skipped row, and a new order shifts the pages. `src/db.ts` counts every access, `GET /stats` reports the counter.

`src/fast-reads.test.ts` seeds a small database of its own and documents the problems. You need Node.js 26.11 or newer for `Database` from `node:sqlite`.

SQLite is a function call away, a database server is a round trip away. `DB_ROUND_TRIP_MS=1` puts such a round trip in front of every query, with ten connections as in a pool. Measure with and without it: the number of queries stays the same, what each one costs does not.

## Setup

```sh
npm install
npm test
npm run seed         # writes shop.db, deterministic
npm start            # Apollo Sandbox on http://localhost:4000/graphql
LOG_LEVEL=debug npm start   # also logs every database query
```

## Exercise

Run the server in one terminal and the measurement in a second one. Set `PORT` in both if 4000 is taken.

1. Measure before you change anything and write down the numbers: `npm run load -- offset 0` and `npm run load -- offset 40000`, each with `DB_ROUND_TRIP_MS=0` and `DB_ROUND_TRIP_MS=1` on the server. What do you expect, and what does the counter say per request?
2. Read `src/fast-reads.test.ts`: why does a page of 20 orders cost 82 queries, and why does an order show up twice?
3. Add `db.items.ofOrders(orderIds)` and `db.products.findByIds(ids)` to `src/db.ts`. Each is one statement with `where … in (select value from json_each(?))`, so it stays prepared for any number of ids.
4. Write `createLoaders(db)` in `src/loaders.ts` with one `DataLoader` each. A batch returns its results in the order of the keys, `[]` for an order without items and `null` for a missing product. Create the loaders per request in the `context` function. `items` and `totalCents` share the same loader, so a page costs 3 queries.
5. Switch `Query.orders` to `orders(first: Int = 20, after: String): OrderConnection!`, as in [recipes/pagination](../pagination/README.md). `src/cursor.ts` is ready. Add `db.orders.after(cursor, limit)` with `where (created_at, id) < (?, ?) order by created_at desc, id desc limit ?`.
6. Replace the two bug tests and the `it.todo` entries with tests for the correct behaviour. Check with `explain query plan` that the query starts at the cursor (`SEARCH`) instead of walking the index (`SCAN`).
7. Measure again: `npm run load -- keyset 0` and `npm run load -- keyset 40000`. `keyset` reads the cursor of the same row from `shop.db`. Which change moved the access count, which one moved p99, and how does the answer depend on the round trip?

## Solution

`solution/` contains a possible solution: `npm run start:solution`.
