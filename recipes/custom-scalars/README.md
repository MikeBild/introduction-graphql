# Custom Scalars

An order API (`src/yoga.ts`) where `placedAt` and `contactEmail` are plain `String`s. Any text is accepted, and every resolver would have to validate it on its own. Custom scalars move that check to the schema boundary.

## Setup

```sh
npm install
npm test
npm start            # GraphiQL on http://localhost:4000/graphql
```

## Exercise

1. Run `npm test` and read `src/scalars.test.ts`: which invalid values get through today?
2. Write a `DateTime` scalar with `GraphQLScalarType` (output, variable input, literal input) and declare it with `@specifiedBy(url: "https://www.rfc-editor.org/rfc/rfc3339")`. Use it for `Order.placedAt` and `OrderFilter.placedAfter`.
3. Register `EmailAddress` from `graphql-scalars` and use it for `contactEmail` and the mutation argument.
4. Prove with tests that invalid variables and literals are rejected before a resolver runs.

Note: In `graphql` 17 the scalar functions are called `coerceOutputValue`, `coerceInputValue` and `coerceInputLiteral`. `serialize`, `parseValue` and `parseLiteral` still work, but are deprecated and will be removed in v18.

## Solution

`solution/` contains a possible solution: `npm run start:solution`.
