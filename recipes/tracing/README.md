# Tracing and Metrics

An order API whose `Order.customer` resolver calls a slow, sometimes failing CRM (`src/schema.ts`). A small Yoga plugin (`src/operation-log.ts`) logs duration and error count per operation – because with GraphQL every answer is HTTP 200 on the same path.

## Setup

```sh
npm install
npm test
npm start            # GraphiQL on http://localhost:4000/graphql
```

## Exercise

1. Run `npm test` and read `src/tracing.test.ts`: why is `query OrdersPage` logged as `anonymous` when the client does not send `operationName`? Read the name from the document instead (`getOperationAST`).
2. Reject anonymous operations with a `GraphQLError` and `extensions.code` before execution.
3. Add `useOpenTelemetry` from `@envelop/opentelemetry` with a `BasicTracerProvider`. Trace resolvers with own logic only (`defaultResolvers: false`) and keep variables and results out of the spans.
4. Aggregate count, error count and duration per operation name, and find the failing `Order.customer` span in a test (`InMemorySpanExporter`).

## Solution

`solution/` contains a possible solution: `npm run start:solution` prints spans to the console.
