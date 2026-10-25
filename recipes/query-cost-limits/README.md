# Query Cost Limits and Persisted Operations

A public order graph (`src/schema.ts`) without any protection: a valid, nested query makes the server produce more than ten thousand orders, and fifty aliases do the same in one line. `load.resolvedOrders` counts what the server had to produce.

## Setup

```sh
npm install
npm test
npm start            # GraphiQL on http://localhost:4000/graphql
npm run manifest     # rebuilds persisted-documents.json from the known operations
```

## Exercise

1. Run `npm test` and read `src/limits.test.ts`: how many orders does the `Explode` query cost?
2. Add `maxDepthPlugin` and `maxAliasesPlugin` (GraphQL Armor, already installed) to `src/yoga.ts`.
3. Write a cost plugin that multiplies every list by its `first` argument (literal or variable) and rejects operations above a limit before any resolver runs. Tip: use `onExecute` – Yoga caches validation results per document, so a validation rule never sees the variables of later requests.
4. Add `usePersistedOperations` with `persisted-documents.json` as allowlist. Let partners with an `x-partner-key` header send own queries via `allowArbitraryOperations` – the limits stay active for them.

Note: this recipe uses `graphql` 16, because the GraphQL Armor packages depend on `graphql` 16. GraphQL Yoga 6 supports both 16 and 17.

## Solution

`solution/` contains a possible solution: `npm run start:solution` (GraphiQL then needs the header `x-partner-key: partner-secret`).
