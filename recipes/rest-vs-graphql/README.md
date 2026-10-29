# REST vs. GraphQL

The same order overview of the Werkstatt-Shop, built twice in one Express 5 app: classic REST routes under `/api` (`src/rest.ts`) and GraphQL on Apollo Server 5 under `/graphql` (`src/app.ts`). The tests count requests and bytes, so you can see over- and underfetching instead of only hearing about it.

## Setup

```sh
npm install
npm test
npm start            # Apollo Sandbox on http://localhost:4000/graphql, REST on http://localhost:4000/api/orders
```

## Exercise

1. Run `npm test` and read `src/overview.test.ts`: How many requests does the view of placed orders need with REST, and which fields are never shown?
2. Add a `Product` type (`id`, `name`, `priceCents`) and replace `OrderItem.productId` with `OrderItem.product` in `src/app.ts`.
3. Write one `OpenOrderOverview` query with customer name, quantity, product name and `totalCents` (Σ quantity × priceCents), and assert it in a test.
4. Note for your own platform: Which view would profit, and what stays REST (files, webhooks, partner APIs)?

## Solution

`solution/` contains a possible solution: `npm run start:solution`.
