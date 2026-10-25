# Operations: Variables, Fragments, Aliases

A small order API (`src/yoga.ts`) and a client operation in `operations/order-overview.graphql`. The tests send the document with `variables` and `operationName`, just like a real client.

## Setup

```sh
npm install
npm test
npm start            # GraphiQL on http://localhost:4000/graphql
```

## Exercise

1. Extend `operations/order-overview.graphql`: load the paid orders with the alias `paid` in the same request.
2. Add `status`, `total` and `customer { name }` to the `OrderRow` fragment.
3. Add a second operation `OrderDetail($id: ID!, $withItems: Boolean!)` that shows `items` only with `@include(if: $withItems)`.
4. Run the document once without `operationName` – what does the server answer? Fix the test.

## Solution

`solution/operations/order-overview.graphql` and `solution/operations.test.ts`.
