# Custom Scalars

The order API of the Werkstatt-Shop on Apollo Server 5 with Express 5 (`src/app.ts`), where `Order.createdAt` and `Customer.email` are plain `String`s. Any text is accepted, and every resolver would have to validate it on its own. Custom scalars move that check to the schema boundary.

## Setup

```sh
npm install
npm test
npm start            # Apollo Sandbox on http://localhost:4000/graphql
```

## Exercise

1. Run `npm test` and read `src/scalars.test.ts`: which invalid values get through today?
2. Write a `DateTime` scalar with `GraphQLScalarType` – `serialize` (output), `parseValue` (variables), `parseLiteral` (values in the query text) – and declare it with `@specifiedBy(url: "https://www.rfc-editor.org/rfc/rfc3339")`. Use it for `Order.createdAt` and `OrderFilter.createdAfter`.
3. Register `EmailAddress` from `graphql-scalars` and use it for `Customer.email` and the mutation argument.
4. Prove with tests that invalid variables and literals are rejected before a resolver runs.

Note: Apollo Server 5 builds on `graphql` 16, where the scalar functions are called `serialize`, `parseValue` and `parseLiteral`. `graphql` 17 renames them to `coerceOutputValue`, `coerceInputValue` and `coerceInputLiteral`.

## Solution

`solution/` contains a possible solution: `npm run start:solution`.
