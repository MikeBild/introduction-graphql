# REST vs. GraphQL

The same order overview, built twice: with a classic REST API (`src/rest.ts`) and with GraphQL Yoga (`src/yoga.ts`). The tests count requests and bytes, so you can see over- and underfetching instead of only hearing about it.

## Setup

```sh
npm install
npm test
npm start            # GraphiQL on http://localhost:4000/graphql
```

## Exercise

1. Run `npm test` and read `src/overview.test.ts`: How many requests does the open-orders view need with REST, and which fields are never shown?
2. Add a `Product` type and replace `OrderItem.productId` with `OrderItem.product` in `src/yoga.ts`.
3. Write one `OpenOrderOverview` query with customer name, quantity and product title, and assert it in a test.
4. Note for your own platform: Which view would profit, and what stays REST (files, webhooks, partner APIs)?

## Solution

`solution/` contains a possible solution: `npm run start:solution`.
