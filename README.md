*English · [Deutsch](README.de.md)*

# Exercises: GraphQL

Exercise repo for the workshop “GraphQL from schema to production”. The 24 exercises follow the workshop from easy to hard, each with a starting point (`src/`), tests and a solution (`solution/`). All exercises take place in the workshop shop with products, customers and orders – servers with Apollo Server 5 on Express 5, clients with Apollo Client 4, tests with Vitest.

## What you learn

- Design a schema in SDL, write resolvers and serve them with Apollo Server 5 on Express 5 – verified over HTTP with Vitest
- Build clients with Apollo Client 4: operations with variables and fragments, pagination with connections, optimistic UI with the normalized cache
- Take the graph to production: DataLoader and a context per request, authentication and authorization, Errors as Data, subscriptions, federation, query cost limits, response caching, schema evolution and tracing

## Prerequisites

- **Node.js 26** or newer – the exercises run TypeScript directly with `node src/server.ts`, without a build step (`engines` in every `package.json`). The exercise `fast-reads` needs Node.js 26.11 for `node:sqlite`.
- An editor with TypeScript support, for example VS Code
- A browser for Apollo Sandbox at http://localhost:4000/graphql, plus `curl` for requests from the command line
- Basic knowledge of TypeScript and Node.js, and React for the client exercises. To refresh: [introduction-nodejs](https://github.com/MikeBild/introduction-nodejs) and [introduction-react](https://github.com/MikeBild/introduction-react)

## Setup

```bash
git clone https://github.com/MikeBild/introduction-graphql.git
cd introduction-graphql/recipes/shop-server
npm install
npm test             # Vitest
npm run typecheck    # TypeScript strict
npm start            # Apollo Sandbox on http://localhost:4000/graphql
```

There is no shared `package.json` and no check script for all exercises: every exercise under `recipes/` is its own npm project with its own `package-lock.json`.

## How to work on an exercise

Install the dependencies in the folder of the exercise, not in the root directory:

```text
recipes/
  dataloader/
    README.md              starting point, task in steps, solution
    package.json           scripts: start, start:solution, test, test:watch, typecheck, format
    src/                   your starting point
      app.ts               schema, resolvers and Express app
      server.ts            starts the app on port 4000 (PORT overrides)
      db.ts                sample data of the workshop shop
      test-client.ts       starts the app for the tests on a free port
      dataloader.test.ts   tests with Vitest over real HTTP requests
    solution/              a possible solution, same structure
```

1. Read the `README.md` of the exercise. It describes the starting point and its weaknesses, then the task in numbered steps.
2. Start with `npm test`. The tests in `src/` document the problem: some fail, some pass for the wrong reason. Work through the steps in `src/` until `npm test` and `npm run typecheck` pass and the tests check the right reason.
3. Then compare with `solution/`; `npm run start:solution` starts the solution.

```bash
cd recipes/dataloader
npm install
npm start               # starting point with Apollo Sandbox on http://localhost:4000/graphql
npm test                # Vitest once
npm run test:watch      # Vitest in watch mode
npm run typecheck       # TypeScript strict
npm run start:solution  # the solution
```

Some exercises bring their own scripts or a second process:

| Exercise | Special feature |
| --- | --- |
| `shop-client` | Vite project: `npm start` opens http://localhost:5173 and proxies `/graphql` to port 4000. Start `shop-server` in a second terminal first (`npm run start:solution`). `npm run codegen` generates the types of the operations. |
| `fast-reads` | `npm run seed` writes `shop.db` with 50,000 orders, `npm run load -- offset 0` measures accesses and latency. |
| `schema-evolution` | `npm run schema:diff` compares `schema/production.graphql` with `schema/current.graphql` and stops on breaking changes. |
| `query-cost-limits` | `npm run manifest` rebuilds `persisted-documents.json` from the known operations. |
| `ddd-services` | `npm run start:shipping` starts the shipping service on port 4001. |
| `federation` | Gateway on port 4000, the subgraphs `customers` and `orders` on 4001 and 4002. |
| `rest-wrapping` | The inventory REST service runs on port 4001. |
| `operations-fragments`, `optimistic-ui` | No `start:solution`: the solution consists of operations and tests in `solution/`. |

## Exercises

The order goes from easy to hard. The level shows the difficulty: 1 basics, 2 everyday work, 3 architecture and operations. Every exercise runs on Apollo Server 5 and Express 5; the column “Plus” names what else is in play.

### Level 1 – Basics

| No. | Lesson | Exercise | Plus |
| --- | --- | --- | --- |
| 01 | REST and GraphQL deliver the same overview – count requests and bytes | [rest-vs-graphql](recipes/rest-vs-graphql/README.md) | – |
| 02 | A first Apollo Server: SDL, resolvers, a mutation with input and payload, tests over HTTP | [shop-server](recipes/shop-server/README.md) | – |
| 03 | Operations: variables, fragments, aliases | [operations-fragments](recipes/operations-fragments/README.md) | – |
| 04 | Resolvers without N+1: DataLoader batches per request | [dataloader](recipes/dataloader/README.md) | DataLoader |
| 05 | Errors as Data: domain errors belong in the schema | [errors-as-data](recipes/errors-as-data/README.md) | – |

### Level 2 – Everyday work

| No. | Lesson | Exercise | Plus |
| --- | --- | --- | --- |
| 06 | A React client with Apollo Client 4: one fragment per row, types from GraphQL Codegen | [shop-client](recipes/shop-client/README.md) | React 19, Apollo Client 4, Vite, GraphQL Codegen |
| 07 | One context per request: identity, loaders, tests without HTTP | [context](recipes/context/README.md) | DataLoader |
| 08 | Layers and modules: one schema from many folders | [modules](recipes/modules/README.md) | DataLoader, zod |
| 09 | Authentication with access tokens (OIDC, jose) and authorization per field | [auth](recipes/auth/README.md) | jose, Apollo Client 4 |
| 10 | The me pattern: whoever asks gets their own view | [me-pattern](recipes/me-pattern/README.md) | DataLoader |
| 11 | Pagination with connections and Apollo cache policies | [pagination](recipes/pagination/README.md) | Apollo Client 4 |
| 12 | Optimistic UI with the normalized Apollo Client cache | [optimistic-ui](recipes/optimistic-ui/README.md) | Apollo Client 4 |
| 13 | Validate custom scalars at the schema boundary | [custom-scalars](recipes/custom-scalars/README.md) | graphql-scalars |
| 14 | Wrapping REST: a GraphQL facade in front of a third-party service | [rest-wrapping](recipes/rest-wrapping/README.md) | DataLoader |

### Level 3 – Architecture and operations

| No. | Lesson | Exercise | Plus |
| --- | --- | --- | --- |
| 15 | Live order status with subscriptions over WebSocket | [subscriptions](recipes/subscriptions/README.md) | graphql-ws, ws, Apollo Client 4 |
| 16 | Apollo Federation: two subgraphs, one supergraph | [federation](recipes/federation/README.md) | Apollo Gateway, Apollo Subgraph |
| 17 | Query cost limits and persisted operations for a public graph | [query-cost-limits](recipes/query-cost-limits/README.md) | – |
| 18 | Response caching with `@cacheControl` | [response-caching](recipes/response-caching/README.md) | Apollo Response Cache Plugin |
| 19 | Schema evolution: extend additively, find breaking changes | [schema-evolution](recipes/schema-evolution/README.md) | GraphQL Inspector |
| 20 | Tracing and metrics per operation as an Apollo Server plugin | [tracing](recipes/tracing/README.md) | OpenTelemetry |
| 21 | DDD in the graph: bounded contexts and aggregates | [ddd](recipes/ddd/README.md) | DataLoader |
| 22 | The graph stays, services grow behind it: a module becomes a service | [ddd-services](recipes/ddd-services/README.md) | DataLoader |
| 23 | Fast reads: measure first, then batches and keyset pagination | [fast-reads](recipes/fast-reads/README.md) | DataLoader, node:sqlite |
| 24 | BFF and domain boundaries | [bff-gateway](recipes/bff-gateway/README.md) | – |

Three folders under `recipes/` are placeholders without content: [prefetching](recipes/prefetching/README.md), [verify-graphql-tags](recipes/verify-graphql-tags/README.md) and [server-side-rendering-apollo](recipes/server-side-rendering-apollo/README.md).

## The workshop shop

Products, customers and orders. Money is always in whole cents (`priceCents`, `totalCents`). An order moves through `DRAFT → PLACED → PAID → SHIPPED`; `CANCELLED` is only allowed from `DRAFT` or `PLACED`. The schema lives in [`recipes/shop-server/src/schema.graphql`](recipes/shop-server/src/schema.graphql); every exercise brings its own sample data in `src/`. The caller is in the header – in `shop-server` as `authorization: Bearer token-ada` for `c-1` or `token-grace` for `c-2`; every exercise names its header in the README.

## Stack

**Stack (October 2026):** Apollo Server 5 (`@apollo/server`) as middleware in Express 5 (`@as-integrations/express5`) · graphql 16 · TypeScript 7 strict · Vitest 5 · Prettier. There is no build step: Node.js 26 runs the `.ts` files directly, which is why every `tsconfig.json` sets `erasableSyntaxOnly`.

Further packages only where the exercise needs them:

- DataLoader 2 in `dataloader`, `context`, `modules`, `me-pattern`, `rest-wrapping`, `ddd`, `ddd-services` and `fast-reads`
- Apollo Client 4 in `shop-client`, `auth`, `pagination`, `optimistic-ui` and `subscriptions`
- React 19, Vite 8, Testing Library, jsdom and GraphQL Codegen 7 (`typescript-operations`) in `shop-client`
- jose 6 in `auth`
- zod 4 in `modules`
- graphql-scalars 2 in `custom-scalars`
- graphql-ws 6, ws 8 and graphql-subscriptions 3 in `subscriptions`
- Apollo Gateway 2, `@apollo/subgraph` and `@apollo/composition` in `federation`
- `@apollo/server-plugin-response-cache` 5 in `response-caching`
- GraphQL Inspector 8 (`@graphql-inspector/core`) in `schema-evolution`
- OpenTelemetry (`@opentelemetry/api`, `@opentelemetry/sdk-trace-base`) in `tracing`
- `node:sqlite` from the Node.js standard library in `fast-reads`

## Chapters

The theory is available as English chapters in the folder [`introduction-graphql/`](introduction-graphql/). They come from the earlier version of the workshop (as of January 2022); some of the code samples there still use `express-graphql` and Mocha. The exercises show the current implementation with Apollo Server 5.

- Getting started: [Why GraphQL](introduction-graphql/intro.md) · [What is GraphQL](introduction-graphql/graphql.md) · [Architecture](introduction-graphql/architecture.md) · [Principles](introduction-graphql/principles.md)
- Queries: [Queries](introduction-graphql/queries.md) · [Variables](introduction-graphql/variables.md) · [Fragments](introduction-graphql/fragments.md) · [Directives](introduction-graphql/directives.md) · [Introspection](introduction-graphql/introspection.md) · [Clients](introduction-graphql/clients.md)
- Schema and execution: [Type System](introduction-graphql/types.md) · [Schema](introduction-graphql/schema.md) · [Validation](introduction-graphql/validation.md) · [Resolver](introduction-graphql/resolver.md) · [Error Handling](introduction-graphql/errors.md) · [Mutations](introduction-graphql/mutations.md)
- Further reading: [Paging](introduction-graphql/paging.md) · [Versioning](introduction-graphql/versioning.md) · [Subscriptions](introduction-graphql/subscriptions.md) · [Authentication and Authorization](introduction-graphql/auth.md) · [Caching](introduction-graphql/caching.md) · [Advanced GraphQL](introduction-graphql/advanced-graphql.md) · [Batch, Defer, Live](introduction-graphql/soon.md) · [GraphQL with ExpressJS](introduction-graphql/expressjs.md) · [Testing GraphQL](introduction-graphql/testing.md)
- Also: [GraphQL Specification](https://spec.graphql.org/) · [Resources](introduction-graphql/resources.md)

## Workshop and slides

- Workshop: [“Architecture: DDD, CQRS, and Event Sourcing”](https://workshops.mikebild.dev/w/architektur-ddd-cqrs/remote/)
- Workshop: [“Full-stack with TypeScript, Node.js, GraphQL, and React in 6 days”](https://workshops.mikebild.dev/w/fullstack/onsite/)
- Workshop: [“Design and build GraphQL APIs”](https://workshops.mikebild.dev/w/graphql-kompakt/online/)
- Workshop: [“GraphQL from schema to production”](https://workshops.mikebild.dev/w/graphql/onsite/)
- Workshop: [“Microservices with Node.js, Express 5, and Docker Compose”](https://workshops.mikebild.dev/w/microservices/remote/)
- Workshop: [“GraphQL in 60 minutes”](https://workshops.mikebild.dev/w/mini-kurs/online/)
- Workshop: [“Node.js backend, functional and type-safe”](https://workshops.mikebild.dev/w/nodejs/remote/)
- Workshop: [“React with Vite to an installable PWA”](https://workshops.mikebild.dev/w/react-fortgeschritten/remote/)
- Workshop: [“React with TypeScript all the way to production”](https://workshops.mikebild.dev/w/react/remote/)
- Slides: [slides.mikebild.dev/introduction-graphql](https://slides.mikebild.dev/introduction-graphql.html)
- PDF: [slides.mikebild.dev/introduction-graphql.pdf](https://slides.mikebild.dev/introduction-graphql.pdf)
- Articles on mikebild.dev (in German):
  - [GraphQL-Konzepte: Schema, Resolver, Ausführung](https://www.mikebild.dev/de/blog/graphql-konzepte-schema-resolver-ausfuehrung/)
  - [GraphQL-Überblick: Vom Schema zur föderierten API](https://www.mikebild.dev/de/blog/graphql-ueberblick-vom-schema-zur-foederierten-api/)

## Archive

Older examples stay in the repo for comparison but are no longer maintained. Their code dates from January 2022:

- [`archive/apollo-example/`](archive/apollo-example/README.md) – Apollo Server 2 and React 17 with apollo-boost as a Lerna monorepo with Parcel. Replaced by `shop-server` and `shop-client`, whose READMEs point to it for comparison.
- [`archive/external-pubsub-subscriptions/`](archive/external-pubsub-subscriptions/README.md) – only a pointer to the exercise `subscriptions`.
- [`aws-example/`](aws-example/README.md) – AWS AppSync with Lambda via AWS CDK 2 and a React 17 client. The README there is still the one of the Apollo example.
- [`graphql-server-example-dotnet/`](graphql-server-example-dotnet/README.md) – a GraphQL server in C# with GraphQL.Server.All 5.2 on .NET Core 3.1. The tasks in `.vscode/` belong to this example.

## Reporting issues

Found a bug or have an idea? Open an [issue](https://github.com/MikeBild/introduction-graphql/issues). Please do not report security vulnerabilities publicly; use the contact form on [mikebild.dev](https://www.mikebild.dev) instead.

## License

[MIT](LICENSE)
