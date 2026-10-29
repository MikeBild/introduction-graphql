# Wrapping REST

A GraphQL facade on Apollo Server 5 with Express 5 (`src/app.ts`) in front of an existing inventory REST service of another team (`src/inventory-service.ts`, also Express 5). The workshop shop's catalog (`src/catalog.ts`) knows name and price of each product, the stock lives in the REST service. The starting point works, but calls the service once per product, has no timeout, and one failing call wipes out the whole product list – and leaks the upstream error text to the client.

## Setup

```sh
npm install
npm test
npm start            # Apollo Sandbox on http://localhost:4000/graphql, inventory REST on :4001
```

## Exercise

1. Run `npm test` and read `src/rest-wrapping.test.ts`: count the REST calls and look at the answer when the inventory fails.
2. Move the REST access into one client module and bundle calls per request with a `DataLoader` and the collection endpoint `/stock?ids=…`. Create the loader in the `context` function of `expressMiddleware` and forward the `authorization` header.
3. Give every call a timeout with `AbortSignal.timeout(…)` and map failures to a `GraphQLError` with `extensions.code` (`UPSTREAM_TIMEOUT`, `UPSTREAM_ERROR`) – without the upstream text.
4. Make `Product.stock` nullable and prove with a test that a slow service only costs that field.

## Solution

`solution/` contains a possible solution: `npm run start:solution`.
