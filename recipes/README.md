# GraphQL recipes

Runnable recipes, from easy to hard, all around one running example: the workshop shop with products, customers and orders (money in whole cents, order status DRAFT → PLACED → PAID → SHIPPED, CANCELLED only from DRAFT or PLACED). `src/` is the starting point, `solution/` a possible solution, the README holds the exercise. Node.js 26 or newer; servers run Apollo Server 5 on Express 5. In each folder `npm ci`, `npm test` (Vitest) and `npm run typecheck`.

### Level 1 – basics

- [REST vs. GraphQL](rest-vs-graphql/README.md) – Apollo Server 5, Express 5
- [Workshop shop: a first Apollo Server on Express (SDL, mutations, testing)](shop-server/README.md) – Apollo Server 5, Express 5
- [Operations: Variables, Fragments, Aliases](operations-fragments/README.md) – Apollo Server 5, Express 5
- [Resolvers without N+1: DataLoader for products](dataloader/README.md) – Apollo Server 5, Express 5, DataLoader
- [Errors as Data](errors-as-data/README.md) – Apollo Server 5, Express 5

### Level 2 – everyday practice

- [Workshop shop: a React client with Apollo Client 4 and Codegen](shop-client/README.md) – React 19, Apollo Client 4, GraphQL Codegen (typescript-operations)
- [One context per request](context/README.md) – Apollo Server 5, Express 5, DataLoader
- [Layers and modules: one schema from many folders](modules/README.md) – Apollo Server 5, Express 5, zod
- [Authentication, access tokens (OIDC, jose) and authorization](auth/README.md) – Apollo Server 5, Express 5, jose, Apollo Client 4
- [The me pattern: every viewer gets their own view](me-pattern/README.md) – Apollo Server 5, Express 5
- [Pagination of orders with Connections and Apollo cache policies](pagination/README.md) – Apollo Server 5, Express 5, Apollo Client 4
- [Optimistic UI with the Apollo Client cache](optimistic-ui/README.md) – Apollo Server 5, Express 5, Apollo Client 4
- [Custom Scalars](custom-scalars/README.md) – Apollo Server 5, Express 5, graphql-scalars
- [Wrapping REST](rest-wrapping/README.md) – Apollo Server 5, Express 5, DataLoader

### Level 3 – architecture and operations

- [Live order status with subscriptions](subscriptions/README.md) – Apollo Server 5, Express 5, graphql-ws, ws, Apollo Client 4
- [Apollo Federation](federation/README.md) – Apollo Server 5, Express 5, Apollo Gateway
- [Query Cost Limits and Persisted Operations](query-cost-limits/README.md) – Apollo Server 5, Express 5
- [Response Caching with @cacheControl](response-caching/README.md) – Apollo Server 5, Express 5, Apollo response cache plugin
- [Schema Evolution](schema-evolution/README.md) – Apollo Server 5, Express 5, GraphQL Inspector
- [Tracing and Metrics](tracing/README.md) – Apollo Server 5, Express 5, OpenTelemetry
- [DDD in the graph: bounded contexts and aggregates](ddd/README.md) – Apollo Server 5, Express 5
- [Fast reads: batches and keyset pagination](fast-reads/README.md) – Apollo Server 5, Express 5, DataLoader, node:sqlite
- [BFF and Domain Boundaries](bff-gateway/README.md) – Apollo Server 5, Express 5

### Not written yet

- [Prefetching data](prefetching/README.md)
- [Verify GraphQL-Tags with Webpack-Loader](verify-graphql-tags/README.md)
- [Server-Side Rendering](server-side-rendering-apollo/README.md)
