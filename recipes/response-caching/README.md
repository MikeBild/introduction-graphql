# Response Caching

A product API with a public product list and a private cart per user (`src/schema.ts`). `database.reads` counts every read – right now each identical request goes to the database again.

## Setup

```sh
npm install
npm test
npm start            # GraphiQL on http://localhost:4000/graphql, header "authorization: user-ada"
```

## Exercise

1. Run `npm test` and read `src/caching.test.ts`: how many database reads do three identical requests cause?
2. Add `useResponseCache` from `@graphql-yoga/plugin-response-cache` (already installed) with a global `ttl`, a longer TTL for `Product` via `ttlPerSchemaCoordinate` and `includeExtensionMetadata: true`.
3. Add a `session` function based on the `authorization` header and prove with a test that Ada never sees Alan's cart.
4. Send `updatePrice` and check that the cached product list is invalidated.

Note: `ttlPerType` still works in plugin version 4, but is deprecated in favour of `ttlPerSchemaCoordinate` (keys like `Product` or `Query.products`).

## Solution

`solution/` contains a possible solution: `npm run start:solution`.
