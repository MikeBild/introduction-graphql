# Data caching and batching with DataLoader

An order list with customers (`src/yoga.ts`). Every `Order.customer` resolver asks the database on its own: one query for the list, one more per order – the N+1 problem. `src/db.ts` counts every round trip.

## Setup

```sh
npm install
npm test
npm start            # GraphiQL on http://localhost:4000/graphql
LOG_LEVEL=debug npm start   # also logs every database query
```

## Exercise

1. Run `npm test` and read `src/dataloader.test.ts`: how many database queries does `orders { customer { name } }` cost, and why does `c-1` count twice?
2. Write `createLoaders()` in `src/loaders.ts` with a `DataLoader` for customers on top of `db.customers.findByIds`. The batch function must return the results in the order of the keys and `null` for missing customers – `findByIds` returns table order.
3. Create the loaders per request in Yoga's `context` and let `Order.customer` call `context.loaders.customer.load(...)`.
4. Prove it with a test: the list with customers needs exactly **two** database queries, a second request starts with a fresh loader.
5. Bonus: add a `renameCustomer` mutation. Why does it have to call `loaders.customer.clear(id)` before it returns the customer?

## Solution

`solution/` contains a possible solution: `npm run start:solution`.
