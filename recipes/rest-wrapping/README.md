# Wrapping REST

A GraphQL facade (`src/yoga.ts`) in front of an existing inventory REST service (`src/inventory-service.ts`). The starting point works, but calls the service once per product, has no timeout, and one failing call wipes out the whole product list.

## Setup

```sh
npm install
npm test
npm start            # GraphQL on http://localhost:4000/graphql, inventory REST on :4001
```

## Exercise

1. Run `npm test` and read `src/rest-wrapping.test.ts`: count the REST calls and look at the answer when the inventory fails.
2. Move the REST access into one client module and bundle calls per request with a `DataLoader` and the collection endpoint `/stock?skus=…`. Forward the `authorization` header.
3. Give every call a timeout with `AbortSignal.timeout(…)` and map failures to a `GraphQLError` with `extensions.code` (`UPSTREAM_TIMEOUT`, `UPSTREAM_ERROR`).
4. Make `Product.available` nullable and prove with a test that a slow service only costs that field.

## Solution

`solution/` contains a possible solution: `npm run start:solution`.
