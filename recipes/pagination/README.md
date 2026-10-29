# Pagination with Connections

An order list, newest first, on Apollo Server 5 with Express 5 (`src/app.ts`). `Query.orders` pages with `offset` and `limit`: simple, but the page shifts as soon as a new order arrives, and nothing stops a client from asking for everything.

## Setup

```sh
npm install
npm test
npm start            # Apollo Sandbox on http://localhost:4000/graphql
```

## Exercise

1. Run `npm test` and read `src/pagination.test.ts`: which order shows up twice, and why?
2. Switch `Query.orders` to a connection: `orders(first: Int = 20, after: String): OrderConnection!` with `edges { node cursor }` and `pageInfo { hasNextPage hasPreviousPage startCursor endCursor }`.
3. Make the cursor opaque (Base64 of the id) and load the page **after** the row it points to – not after a position.
4. Load one row more than `first` to know `hasNextPage`, and cap `first` at 100.
5. Prove it with tests: the last page has `hasNextPage: false`, a new order on top does not shift the next page, `first: 100000` returns 100 edges.
6. Client: create an Apollo Client with `typePolicies: { Query: { fields: { orders: relayStylePagination() } } }` and load the next page with `fetchMore({ variables: { after: endCursor } })`. Test that one watched query now holds both pages – and that it took exactly two requests. What happens without the type policy?

Sorting by a date? Then the cursor has to carry the date **and** the id, otherwise orders with the same timestamp get lost. `src/store.ts` breaks ties by id for that reason.

## Solution

`solution/` contains a possible solution: `npm run start:solution`, the client in `solution/client.ts`.
