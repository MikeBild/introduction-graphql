# GraphQL recipes

Runnable recipes, from easy to hard. `src/` is the starting point, `solution/` a possible solution, the README holds the exercise. Node.js 26 or newer; in each folder `npm ci`, `npm test` (Vitest) and `npm run typecheck`. Node.js servers run on Express 5.

### Level 1 – basics

- [REST vs. GraphQL](rest-vs-graphql/README.md) – GraphQL Yoga
- [Articles: a first Apollo Server on Express (SDL, mutations, testing)](articles-server/README.md) – Apollo Server 5, Express 5
- [Operations: Variables, Fragments, Aliases](operations-fragments/README.md) – GraphQL Yoga
- [Resolvers without N+1: DataLoader](dataloader/README.md) – Apollo Server 5, Express 5, DataLoader
- [Errors as Data](errors-as-data/README.md) – GraphQL Yoga

### Level 2 – everyday practice

- [Articles: a React client with Apollo Client 4 and Codegen](articles-client/README.md) – React 19, Apollo Client 4, GraphQL Codegen
- [Authentication and Authorization](auth/README.md) – Apollo Server 5, Express 5
- [Pagination with Connections and Apollo cache policies](pagination/README.md) – Apollo Server 5, Express 5, Apollo Client 4
- [Optimistic UI with the Apollo Client cache](optimistic-ui/README.md) – Apollo Server 5, Express 5, Apollo Client 4
- [Custom Scalars](custom-scalars/README.md) – GraphQL Yoga
- [Wrapping REST](rest-wrapping/README.md) – GraphQL Yoga

### Level 3 – architecture and operations

- [Apollo Federation](federation/README.md) – Apollo Server 5, Express 5, Apollo Gateway
- [Query Cost Limits and Persisted Operations](query-cost-limits/README.md) – GraphQL Yoga
- [Response Caching](response-caching/README.md) – GraphQL Yoga
- [Schema Evolution](schema-evolution/README.md) – GraphQL Yoga
- [Tracing and Metrics](tracing/README.md) – GraphQL Yoga
- [BFF and Domain Boundaries](bff-gateway/README.md) – GraphQL Yoga

### Not written yet

- [Prefetching data](prefetching/README.md)
- [Verify GraphQL-Tags with Webpack-Loader](verify-graphql-tags/README.md)
- [External Pub/Sub and GraphQL-Subscriptions](external-pubsub-subscriptions/README.md)
- [Server-Side Rendering](server-side-rendering-apollo/README.md)
