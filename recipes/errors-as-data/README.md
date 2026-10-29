# Errors as Data

The order API of the Werkstatt-Shop on Apollo Server 5 with Express 5 (`src/app.ts`), with a `placeOrder` mutation. Right now every failure is thrown. A `GraphQLError` with `extensions.code` reaches the client as intended. Every other error becomes `INTERNAL_SERVER_ERROR` – and Apollo Server passes its internal message on. The client cannot tell "out of stock" from a crash, except by parsing text.

## Setup

```sh
npm install
npm test
npm start            # Apollo Sandbox on http://localhost:4000/graphql, send header "authorization: c-1"
```

## Exercise

1. Run `npm test` and read `src/errors.test.ts`: which error has a code, which one leaks an internal message, and why is `customer` only `null` in one order?
2. Model the expected failures in the schema: `union PlaceOrderResult = PlaceOrderSuccess | OutOfStock | InvalidAddress` as the return type of `placeOrder`.
3. Return the business failures as values (with `__typename`) instead of throwing. Keep `UNAUTHENTICATED` as a `GraphQLError`.
4. Query the result with `__typename` and inline fragments and assert all three cases in a test.
5. Add a `formatError` to `ApolloServer` that logs technical errors and replaces their message with `Internal server error` – code and path stay.

## Solution

`solution/` contains a possible solution: `npm run start:solution`.
