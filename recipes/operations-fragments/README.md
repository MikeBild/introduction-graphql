# Operations: Variables, Fragments, Aliases

The order API of the Werkstatt-Shop on Apollo Server 5 with Express 5 (`src/app.ts`) and a client operation in `operations/order-overview.graphql`. The tests send the document with `variables` and `operationName` over HTTP, just like a real client.

## Setup

```sh
npm install
npm test
npm start            # Apollo Sandbox on http://localhost:4000/graphql
```

## Exercise

1. Extend `operations/order-overview.graphql`: next to the open orders (`open`, status `PLACED`) load the paid orders with the alias `paid` in the same request.
2. Add `status`, `totalCents` and `customer { name }` to the `OrderRow` fragment.
3. Add a second operation `OrderDetail($id: ID!, $withItems: Boolean!)` that shows `items` only with `@include(if: $withItems)`.
4. Run the document once without `operationName` – what does the server answer? Fix the test.

## Solution

`solution/operations/order-overview.graphql` and `solution/operations.test.ts`.
