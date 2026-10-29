# Live order status with subscriptions

Orders of the workshop shop move `PLACED → PAID → SHIPPED` (`src/app.ts`, Apollo Server 5 on Express 5). Right now everything is HTTP: a client that wants to show the new status has to ask again and again. `src/subscriptions.test.ts` shows it.

You add a subscription `orderStatusChanged(orderId: ID!): Order!` over WebSocket – with `graphql-ws` and `ws`, the way the Apollo Server docs recommend. Queries and mutations stay on HTTP, both share port and path.

## Setup

```sh
npm install
npm test
npm start            # Apollo Sandbox on http://localhost:4000/graphql
```

## Exercise

1. Run `npm test`: how does a client learn today that an order was paid? What does a subscription over HTTP answer?
2. Add `type Subscription { orderStatusChanged(orderId: ID!): Order! }`. Publish the changed order with `PubSub` from `graphql-subscriptions` in `payOrder` and `shipOrder` – after the business logic.
3. Filter with `withFilter`, so a subscriber only gets the events of their order.
4. Build the schema with `makeExecutableSchema`, attach a `WebSocketServer` from `ws` to the same HTTP server, and serve the schema there with `useServer` from `graphql-ws/use/ws`. Close the WebSockets on shutdown (`drainServer`).
5. Prove it with tests: a `graphql-ws` client subscribes to `o-1`, a mutation over HTTP pays it, the event arrives – and changes of other orders do not.
6. Client: build an Apollo Client whose `ApolloLink.split` sends subscriptions over `GraphQLWsLink` and everything else over `HttpLink`. In React you would then use `useSubscription`.
7. Discuss: the `PubSub` lives in memory of one process. What happens with two server instances behind a load balancer? Swap in an external PubSub (e.g. Redis) behind the same interface.

## Solution

`solution/` contains a possible solution: `npm run start:solution` (subscriptions on `ws://localhost:4000/graphql`, the client in `solution/client.ts`).
