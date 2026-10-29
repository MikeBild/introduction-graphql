# Workshop shop: a first Apollo Server on Express

The workshop shop – products, customers and orders – as a GraphQL API: Apollo Server 5 on Express 5, TypeScript strict. The schema lives in its own SDL file (`src/schema.graphql`), the resolvers and the Express app in `src/app.ts`, the data and the business rule `placeOrder` in `src/data.ts`. Money is always in whole cents (`priceCents`, `totalCents`), ids are branded types.

It replaces the old Apollo Server 2 example, which is kept for comparison in [`legacy/apollo-example/packages/server`](../../legacy/apollo-example/packages/server).

Ordering needs a token in the header `authorization: Bearer …`: `token-ada` (customer `c-1`) or `token-grace` (customer `c-2`).

The exercises build on each other. Work through them in order, in `src/`.

## Setup

```sh
npm install
npm test
npm start            # Apollo Sandbox on http://localhost:4000/graphql
```

## Exercise 1: First server

1. Compare `src/app.ts` with the Apollo Server 2 version in `legacy/apollo-example/packages/server/lib`: `server.listen()` is gone – Apollo Server 5 is middleware in an Express 5 app (`expressMiddleware` from `@as-integrations/express5`). Where did the schema, the resolvers and the context go?
2. Run `npm test`: `Query.products` has no resolver yet, so the non-null list fails – with status 200 and the internal message in `errors`. Would you want clients in production to see that message?
3. Write the resolver for `Query.products` and send the query in Apollo Sandbox and with `curl`:

   ```sh
   curl -s localhost:4000/graphql -H 'content-type: application/json' \
     -d '{"query":"{ products { id name priceCents stock } }"}'
   ```

## Exercise 2: SDL basics

Read `src/schema.graphql` and add a type `Customer` with the non-null fields `id`, `name` and `email`, a list `orders: [Order!]!`, the fields `Order.customer: Customer!` and `OrderItem.product: Product!`, and a query `customer(id: ID!): Customer`. Implement the resolvers. Which nullability did you pick for each field, and why?

## Exercise 3: Mutations with input types

`placeOrder` shows the pattern: a business action with its own input type and a payload that returns the changed object. Add `cancelOrder(input: CancelOrderInput!): CancelOrderPayload!` the same way. The rule: only `DRAFT` or `PLACED` orders can be cancelled (`NOT_CANCELLABLE`), and only by the customer who ordered (`FORBIDDEN`).

## Exercise 4: Testing with Vitest over HTTP

Write tests that send real HTTP requests to the Express app on a free port (`src/test-client.ts` starts it with `listen(0)`): the query `products`, and `placeOrder` without a token (`UNAUTHENTICATED`, status 200, `data: null`). What status does a request with invalid variables get?

## Solution

`solution/` contains a possible solution for all four exercises: `npm run start:solution`.
