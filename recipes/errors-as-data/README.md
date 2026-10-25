# Errors as Data

An order API with a `placeOrder` mutation (`src/yoga.ts`). Right now every failure is thrown: Yoga passes a `GraphQLError` with `extensions.code` through, but masks every other error as `Unexpected error.` – so the client cannot tell "out of stock" from a crash.

## Setup

```sh
npm install
npm test
npm start            # GraphiQL on http://localhost:4000/graphql, send header "authorization: c-1"
```

## Exercise

1. Run `npm test` and read `src/errors.test.ts`: which error is masked, which reaches the client, and why is `customer` only `null` in one order?
2. Model the expected failures in the schema: `union PlaceOrderResult = PlaceOrderSuccess | OutOfStock | InvalidAddress` as the return type of `placeOrder`.
3. Return the business failures as values (with `__typename`) instead of throwing. Keep `UNAUTHENTICATED` as a `GraphQLError`.
4. Query the result with `__typename` and inline fragments and assert all three cases in a test.

## Solution

`solution/` contains a possible solution: `npm run start:solution`.
