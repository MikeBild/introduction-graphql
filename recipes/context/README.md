# One context per request

The orders of the workshop shop, with a context that does not deserve the name yet (`src/app.ts`). The loaders are created once at startup, so their cache outlives the request and is shared between all users. A resolver writes into the context and hopes that another resolver reads it in time. And the request id never reaches a resolver. `src/context.test.ts` documents all three bugs, each one passes for the wrong reason.

## Setup

```sh
npm install
npm test
npm start            # Apollo Sandbox on http://localhost:4000/graphql
```

## Exercise

1. Run `npm test` and read `src/context.test.ts`: why does `orderCount` return `0` although `orders` returns four orders?
2. Write `createContext({ req })` in a new file `src/context.ts`. It returns a frozen object with `requestId` (from the `x-request-id` header, otherwise `randomUUID()`) and fresh `loaders`. Export the type `Context` as `Readonly<{ requestId: string; loaders: Loaders }>`.
3. Pass it to `expressMiddleware(server, { context: createContext })` and type the server with `new ApolloServer<Context>`. Remove the module-level `loaders`.
4. Stop writing into the context: `orders` and `orderCount` both call `context.loaders.orders.load('all')`. One database query serves both fields.
5. Replace the three bug tests and the `it.todo` entries with tests for the correct behaviour.
6. Prove that resolvers run without HTTP: export `createServer()` and call `server.executeOperation(operation, { contextValue })` with a hand-written context.

## Solution

`solution/` contains a possible solution: `npm run start:solution`.
