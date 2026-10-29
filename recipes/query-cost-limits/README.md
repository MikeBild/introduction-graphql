# Query Cost Limits and Persisted Operations

A public order graph of the workshop shop on Apollo Server 5 with Express 5 (`src/app.ts`, schema in `src/schema.ts`) without any protection: a valid, nested query makes the server produce more than ten thousand orders, and fifty aliases do the same in one line. `load.resolvedOrders` counts what the server had to produce.

## Setup

```sh
npm install
npm test
npm start            # Apollo Sandbox on http://localhost:4000/graphql
npm run manifest     # rebuilds persisted-documents.json from the known operations
```

## Exercise

1. Run `npm test` and read `src/limits.test.ts`: how many orders does the `Explode` query cost?
2. Write two validation rules – maximum depth 5, maximum 5 aliases – and pass them to `new ApolloServer({ validationRules })`. They run before any resolver.
3. Write a cost check that multiplies every list by its `first` argument (literal or variable) and rejects operations above 2,000. Tip: it cannot be a validation rule – Apollo caches validation per document, so a rule never sees the variables of later requests. Use a plugin with `didResolveOperation`, which runs per request with the variables, still before any resolver.
4. Allow own clients only persisted operations: an Express middleware in front of `expressMiddleware` looks up `extensions.persistedQuery.sha256Hash` in `persisted-documents.json` and rejects everything else. Partners with an `x-partner-key` header may send own queries – the limits stay active for them.

Why no extra package? Depth, alias and cost limits are each a few lines on the GraphQL AST, and writing them shows exactly what is being limited. Packages like GraphQL Armor do the same with more options – worth it once you need many rules. And why not Apollo's built-in persisted queries? Automatic persisted queries (APQ) are a cache to save bandwidth: any client can register any query. An allowlist needs a fixed manifest from the client build, so the solution sets `persistedQueries: false`.

## Solution

`solution/` contains a possible solution: `npm run start:solution` (Apollo Sandbox then needs the header `x-partner-key: partner-secret`).
