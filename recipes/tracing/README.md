# Tracing and Metrics

The workshop shop's order API on Apollo Server 5 with Express 5. Its `Order.customer` resolver calls a slow, sometimes failing CRM (`src/schema.ts`). A small Apollo Server plugin (`src/operation-log.ts`) logs duration and error count per operation – because with GraphQL every answer is HTTP 200 on the same path.

## Setup

```sh
npm install
npm test
npm start            # Apollo Sandbox on http://localhost:4000/graphql
```

## Exercise

1. Run `npm test` and read `src/tracing.test.ts`: why is `query OrdersPage` logged as `anonymous` when the client does not send `operationName`? Take the name from the parsed document instead (`requestContext.operationName` after `didResolveOperation`, or `getOperationAST`).
2. Reject anonymous operations in a plugin hook `didResolveOperation` with a `GraphQLError`, `extensions.code` and HTTP status 400 – before execution.
3. Trace with OpenTelemetry: `@opentelemetry/api` and `@opentelemetry/sdk-trace-base` with a `BasicTracerProvider`. Write a plugin that opens one span per operation and child spans in `executionDidStart` → `willResolveField` – for resolvers with own logic only. Keep variables and results out of the spans.
4. Aggregate count, error count and duration per operation name, and find the failing `Order.customer` span in a test (`InMemorySpanExporter`).

No `@envelop` or instrumentation package needed: the plugin API of Apollo Server gives you the operation and every resolver call.

## Solution

`solution/` contains a possible solution: `npm run start:solution` prints spans to the console.
