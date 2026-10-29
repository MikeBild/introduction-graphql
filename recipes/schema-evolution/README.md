# Schema Evolution

The workshop shop's order API on Apollo Server 5 with Express 5. Two schema files: `schema/production.graphql` is what runs in production, `schema/current.graphql` is your working copy. `npm run schema:diff` compares both with GraphQL Inspector and fails on breaking changes – the same check you would run in CI. Money is always in whole cents: `Order.total` is an `Int`.

## Setup

```sh
npm install
npm test
npm run schema:diff  # exit code 1 on breaking changes
npm start            # Apollo Sandbox on http://localhost:4000/graphql
```

The same check with the Inspector CLI: `npx @graphql-inspector/cli diff schema/production.graphql schema/current.graphql`

## Exercise

1. Expand: add `totalPrice: Money!` with `type Money { amountCents: Int!, currency: String! }` to `Order` and mark `total` with `@deprecated(reason: "…")`. Implement the resolver and run `npm run schema:diff`.
2. Make a new input field `PlaceOrderInput.note` required (`String!`) and look at the diff. Then make it optional again.
3. Add the enum value `SHIPPED` – why does Inspector call it dangerous, not safe?
4. Clients identify themselves with Apollo's client awareness headers `apollographql-client-name` and `apollographql-client-version`. Write a small Apollo Server plugin (`requestDidStart` → `didResolveOperation`, with `TypeInfo`) that records who still requests deprecated fields.

## Solution

`solution/` contains a possible solution: `npm run start:solution`.
