# Whoever asks gets their own view

The orders of the workshop shop, with an API that lets the client choose whose data it reads (`src/app.ts`). `Query.orders(customerId: ID!)` takes the id from the client, an Insecure Direct Object Reference (IDOR). The context already knows who is asking, but no resolver uses it. `src/me.test.ts` documents the holes, each test passes for the wrong reason.

Identity comes from a plain `x-viewer-id` header or from a test context to keep this recipe short. Real tokens are the topic of [recipes/auth](../auth/README.md). The users are Ada (`c-1`) and Grace (`c-2`), both customers, and Linus (`s-1`) from the support team.

## Setup

```sh
npm install
npm test
npm start            # Apollo Sandbox on http://localhost:4000/graphql
```

## Exercise

1. Run `npm test` and read `src/me.test.ts`: how much does an attacker need to know to read the orders of Grace?
2. Remove `Query.orders`. Add `type Viewer { id: ID!, name: String!, orders: [Order!]! }` and `Query.me: Viewer`. It is nullable: without a sign-in the answer is `null`, not an error.
3. Create `src/logic.ts` for the business logic: `listOrders(viewer)` returns the own orders, the support team sees all of them. The resolver only passes the viewer on, the logic filters.
4. Add `Order.viewerCanCancel: Boolean!`. Write one function `canCancel(viewer, order)`: the status is `DRAFT` or `PLACED`, and the order belongs to the viewer or the viewer is on the support team.
5. Make `cancelOrder` use the same function. It answers with a union of `CancelOrderSuccess` and `OrderNotCancellable`, and a foreign order gets the same answer as a missing one.
6. Test with a foreign identity: `server.executeOperation(operation, { contextValue })` with Ada as `viewer` must not cancel an order of Grace.
7. Replace the bug tests and the `it.todo` entries with tests for the correct behaviour.

## Answers with `me` are private

A response that contains `me` belongs to one person. As soon as a response cache comes into play, mark `Viewer` with `@cacheControl(scope: PRIVATE)` and give the `responseCachePlugin` a `sessionId`. [recipes/response-caching](../response-caching/README.md) shows both.

## Solution

`solution/` contains a possible solution: `npm run start:solution`.
