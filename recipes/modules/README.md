# From one big file to modules

The orders and products of the workshop shop in a single file (`src/app.ts`): schema, validation, permissions, business rules and data access sit next to each other. A rule that lives in a resolver gets copied, and a copy gets forgotten: `changeOrderItemQuantity` checks identity and status, `removeOrderItem` checks neither. `src/monolith.test.ts` documents both bugs, each one passes for the wrong reason. A third test shows why merging resolvers needs its own code.

Identity comes from a plain `x-customer-id` header to keep this recipe short. Real tokens are the topic of [recipes/auth](../auth/README.md).

## Setup

```sh
npm install
npm test
npm start            # Apollo Sandbox on http://localhost:4000/graphql
```

## Exercise

### Layers

1. Run `npm test` and read `src/monolith.test.ts`: why can a stranger change an order that is already `PLACED`?
2. Create `src/modules/orders/repository.ts` with the data access for orders. It knows SQL, but no rule and no identity.
3. Create `src/modules/orders/logic.ts`. `removeOrderItem(viewer, input)` and `changeOrderItemQuantity(viewer, input)` share one rule: an order in status `DRAFT` may change its items, from `PLACED` on it may not. They return plain values such as `{ ok: false, reason: 'NOT_EDITABLE', order }`, never a `GraphQLError` and never a `__typename`.
4. Create `src/modules/orders/resolvers.ts`. A resolver checks the input with zod (`quantity` of `0` is a valid `Int`, so GraphQL cannot refuse it), takes the viewer from the context, calls the logic and translates the result into a member of the union.
5. Test the rule without a server: call `removeOrderItem` from a new `logic.test.ts`.
6. Test the direction of the imports: `resolvers.ts` may import `logic.ts`, `logic.ts` may import `repository.ts`, never the other way round. `logic.ts` imports nothing from `graphql`.

### Modules

7. Move the SDL of orders into `src/modules/orders/schema.graphql`. Use `extend type Query` and `extend type Mutation`, and keep `type Query` and `type Mutation` empty in one root.
8. Build the module `products` the same way, with `schema.graphql`, `resolvers.ts`, `logic.ts` and `repository.ts`. `OrderItem.product` keeps using the loader from the context, `orders` imports nothing from `products`.
9. Write `mergeResolvers(...modules)` by hand, in a few lines and without `@graphql-tools`. It throws when two modules define the same field.
10. Pass `typeDefs` as an array and the merged resolvers to `new ApolloServer<Context>`.
11. Replace the bug tests and the `it.todo` entries with tests for the correct behaviour.

## What the merge does not see

Two modules that declare the same field with the same type in their SDL pass without a warning, because Apollo Server merges the SDL as well. With different types it refuses to start. `mergeResolvers` catches the case that changes behaviour: two resolvers for one field.

## Solution

`solution/` contains a possible solution: `npm run start:solution`.
