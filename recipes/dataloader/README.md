# Data caching and batching with DataLoader

The orders of the workshop shop with their items and products (`src/app.ts`). Every `OrderItem.product` resolver asks the database on its own: one query for the list, one more per order item – the N+1 problem. `src/db.ts` counts every round trip.

## Setup

```sh
npm install
npm test
npm start            # Apollo Sandbox on http://localhost:4000/graphql
LOG_LEVEL=debug npm start   # also logs every database query
```

## Exercise

1. Run `npm test` and read `src/dataloader.test.ts`: how many database queries does `orders { items { product { name } } }` cost, and why does `p-1` count twice?
2. Write `createLoaders()` in `src/loaders.ts` with a `DataLoader` for products on top of `db.products.findByIds`. The batch function must return the results in the order of the keys and `null` for missing products – `findByIds` returns table order.
3. Create the loaders per request in the `context` function of `expressMiddleware` and let `OrderItem.product` call `context.loaders.product.load(...)`.
4. Prove it with a test: the list with products needs exactly **two** database queries, a second request starts with a fresh loader.
5. Bonus: add a `renameProduct` mutation. Why does it have to call `loaders.product.clear(id)` before it returns the product?

## Solution

`solution/` contains a possible solution: `npm run start:solution`.
