# Response Caching

The product API of the workshop shop on Apollo Server 5 with Express 5 (`src/app.ts`, schema and resolvers in `src/schema.ts`): a public product list and a private cart per user. `database.reads` counts every read – right now each identical request goes to the database again.

## Setup

```sh
npm install
npm test
npm start            # Apollo Sandbox on http://localhost:4000/graphql, header "authorization: user-ada"
```

## Exercise

1. Run `npm test` and read `src/caching.test.ts`: how many database reads do three identical requests cause?
2. Declare the `@cacheControl` directive in the SDL and set hints: `Product` and `Query.products` 60 seconds, `Product.stock` only 10, `Viewer` 30 seconds with `scope: PRIVATE`. Check the `cache-control` header of the responses: which hint wins when a query asks for `stock`?
3. Add `@apollo/server-plugin-response-cache` (already installed) with a `sessionId` from the `authorization` header and prove with a test that Ada never sees Alan's cart.
4. Send `updatePrice` and make sure the product list shows the new price. The plugin has no automatic invalidation, it only knows TTLs: pass it an own `InMemoryLRUCache` (from `@apollo/utils.keyvaluecache`) and clear it in the mutation.

In production the same hints also drive a CDN: the `cache-control` header is exactly what it needs – only for `GET` requests and public responses.

## Solution

`solution/` contains a possible solution: `npm run start:solution`.
