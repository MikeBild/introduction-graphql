# One graph, several bounded contexts

The workshop shop with one module per bounded context: `src/orders` (sales) is connected, `src/shipping` is not. Each module owns its schema, its resolvers and its repository; `order.ts` holds the Order aggregate as pure functions, and every mutation is one use case in `use-cases/`. `placeOrder` shows the pattern. `updateOrder` breaks it: it writes whatever the client sends, so a shipped order can be cancelled. `src/shipping/resolvers.ts` breaks the module boundary with an import. `src/ddd.test.ts` documents these bugs, each one passes for the wrong reason.

## Setup

```sh
npm install
npm test
npm start            # Apollo Sandbox on http://localhost:4000/graphql
```

## Exercise

**Map the domain**

1. Fill in `MAPPING.md`: where does each term of the shop land in the schema?

**Connect the second module**

2. Add the module to the `modules` array in `src/schema.ts`, and merge `shipping.createLoaders()` into `createLoaders` in `src/context.ts`.
3. In `src/shipping/schema.graphql`, add `shippingAddress: Address` to `Customer` and `shipment: Shipment` to `Order` with `extend type`. Resolve both from `context.loaders`, with the id as the only input.
4. Replace the import from `../orders/repository.ts` with `context.loaders.order`. Shipping now knows an id, not an order.

**One mutation, one aggregate**

5. Write `cancel(order)` in `src/orders/order.ts`: it returns a cancelled order from `DRAFT` or `PLACED` and a rejection `OrderNotCancellable` otherwise. Write a test for the broken rule first.
6. Add the use case `use-cases/cancel-order.ts` and the mutation `cancelOrder(input: CancelOrderInput!): CancelOrderResult!`. The union is `CancelOrderSuccess | OrderNotFound | OrderNotCancellable`, and the input names the root: `orderId`.
7. Do the same for `removeOrderItem(input: RemoveOrderItemInput!)` with `orderId` and `productId`. Only a `DRAFT` order changes its items, and the payload returns the parent: the order.
8. Delete `updateOrder` with its input, payload, union and use case.
9. Replace the four bug tests and the `it.todo` entries with tests for the correct behaviour. Include a check that `src/orders` and `src/shipping` never import from each other.

## Solution

`solution/` contains a possible solution: `npm run start:solution`.
