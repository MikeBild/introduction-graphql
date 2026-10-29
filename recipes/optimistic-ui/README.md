# Optimistic UI with a normalized cache

An order API on Apollo Server 5 with Express 5 (`src/app.ts`) and an Apollo Client 4 with `InMemoryCache` (`src/client.ts`) – no browser needed. Two watched queries stand in for two components: the order list (`Orders`) and the order detail (`OrderDetail`). `createNetwork` records every request and can hold the server responses back, so you can see what the UI shows while the server is still busy.

`src/operations.ts` cancels an order and then refetches both views: the user waits for three requests.

## Setup

```sh
npm install
npm test
npm start            # Apollo Sandbox on http://localhost:4000/graphql
```

## Exercise

1. Run `npm test` and read `src/optimistic.test.ts`: why does the cache not update after `cancelOrder` on its own, and why are two refetches needed?
2. Let the mutation return the changed object: `cancelOrder { order { id status } }`. Remove `refetchQueries` – list and detail now update from the payload, because both point to the same cache entry `Order:o-1`.
3. Add an `optimisticResponse` with `__typename` and `id`, so both views show `CANCELLED` while the network is still held.
4. Prove it with tests: one request instead of three, both views update before the server answers, and cancelling the shipped order `o-3` rolls back to `SHIPPED`.
5. Discuss: what would you have to do yourself if the mutation removed the order from the list instead of changing its status?

## Solution

`solution/operations.ts` contains a possible solution, `solution/optimistic.test.ts` the tests.
