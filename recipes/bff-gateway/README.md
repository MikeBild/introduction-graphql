# BFF and Domain Boundaries

A Backend for Frontend for the web shop (`src/bff-web.ts`) on top of two domain modules (`src/domain/orders.ts`, `src/domain/customers.ts`). The schema follows the web page, not the database – good. But the rule "only open orders can be cancelled" lives in a resolver – a job or a second client would have to copy it.

```
web shop -> web BFF ─┐
mobile   -> app BFF ─┼─> domain orders    (rules, data)
nightly job ─────────┘   domain customers
```

## Setup

```sh
npm install
npm test
npm start            # web BFF with GraphiQL on http://localhost:4000/graphql
```

## Exercise

1. Move the cancel rule out of the resolver into the orders domain. Return a result (`{ ok, order }` or `{ ok: false, reason }`) and translate it to a `GraphQLError` code only in the API layer.
2. Add a second BFF for the mobile app with a lean `myOrders` list (customer from the `authorization` header) – it reuses the domain, not the web resolvers.
3. Write a nightly job function `cancelStaleOrders(now, maxAgeDays)` that uses the same rule without GraphQL.
4. Decide for your platform: BFF per client, one central graph, or federation? Write a short ADR:

```md
# ADR: Shape of our GraphQL API

Context: clients …, teams changing the schema …, domains and owners …
Decision: BFF | central graph | federation, because …
Consequences: who runs gateway, limits and monitoring …
```

## Solution

`solution/` contains a possible solution: `npm run start:solution` starts the web BFF on :4000 and the app BFF on :4001.
