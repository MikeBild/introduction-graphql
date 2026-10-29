# Introduction to GraphQL

## Recommendations

- Basic knowledge of
  - JavaScript/TypeScript
  - NodeJS
  - React
- Node.js 26 or newer (the recipes run TypeScript directly, use Apollo Server 5 on Express 5 and test with Vitest)
- Linux, OSX or Windows operation system
- VS Code
- Chrome and Developer Tools
- Postman, cURL or httpie

## GraphQL

- [GraphQL Specification](https://facebook.github.io/graphql/)
- [Why GraphQL](introduction-graphql/intro.md)
- [What is GraphQL](introduction-graphql/graphql.md)
- [Architecture](introduction-graphql/architecture.md)
- [Principles](introduction-graphql/principles.md)
- [Queries](introduction-graphql/queries.md)
- [Variables](introduction-graphql/variables.md)
- [Fragments](introduction-graphql/fragments.md)
- [Clients](introduction-graphql/clients.md)
- [Introspection](introduction-graphql/introspection.md)
- [Type System](introduction-graphql/types.md)
- [Schema](introduction-graphql/schema.md)
- [Execution and Validation Engine]()
  - [Validation](introduction-graphql/validation.md)
  - [Resolver](introduction-graphql/resolver.md)
  - [Error Handling](introduction-graphql/errors.md)
- [Directives](introduction-graphql/directives.md)
- [Mutations](introduction-graphql/mutations.md)
- [Versioning](introduction-graphql/versioning.md)
- [Paging](introduction-graphql/paging.md)
- [Subscriptions](introduction-graphql/subscriptions.md)
- [Advanced GraphQL](introduction-graphql/advanced-graphql.md)
- [Authentication and Authorization](introduction-graphql/auth.md)
- [Caching](introduction-graphql/caching.md)
- [Coming Soon - Defer, Batch, etc.](introduction-graphql/soon.md)
## Examples

- [DotNet (C#) Server Example](graphql-server-example-dotnet/README.md)
- [Legacy: Apollo Server 2 and React 17 example](legacy/apollo-example/README.md) – replaced by the shop recipes below

## Exercises

Runnable recipes, from easy to hard, all around one running example: the workshop shop with products, customers and orders (money in whole cents, order status DRAFT → PLACED → PAID → SHIPPED, CANCELLED only from DRAFT or PLACED). `src/` is the starting point, `solution/` a possible solution, the README holds the exercise. Node.js 26 or newer; servers run Apollo Server 5 on Express 5. In each folder `npm ci`, `npm test` (Vitest) and `npm run typecheck`.

### Level 1 – basics

- [REST vs. GraphQL](recipes/rest-vs-graphql/README.md) – Apollo Server 5, Express 5
- [Workshop shop: a first Apollo Server on Express (SDL, mutations, testing)](recipes/shop-server/README.md) – Apollo Server 5, Express 5
- [Operations: Variables, Fragments, Aliases](recipes/operations-fragments/README.md) – Apollo Server 5, Express 5
- [Resolvers without N+1: DataLoader for products](recipes/dataloader/README.md) – Apollo Server 5, Express 5, DataLoader
- [Errors as Data](recipes/errors-as-data/README.md) – Apollo Server 5, Express 5

### Level 2 – everyday practice

- [Workshop shop: a React client with Apollo Client 4 and Codegen](recipes/shop-client/README.md) – React 19, Apollo Client 4, GraphQL Codegen (typescript-operations)
- [Authentication, access tokens (OIDC, jose) and authorization](recipes/auth/README.md) – Apollo Server 5, Express 5, jose, Apollo Client 4
- [Pagination of orders with Connections and Apollo cache policies](recipes/pagination/README.md) – Apollo Server 5, Express 5, Apollo Client 4
- [Optimistic UI with the Apollo Client cache](recipes/optimistic-ui/README.md) – Apollo Server 5, Express 5, Apollo Client 4
- [Custom Scalars](recipes/custom-scalars/README.md) – Apollo Server 5, Express 5, graphql-scalars
- [Wrapping REST](recipes/rest-wrapping/README.md) – Apollo Server 5, Express 5, DataLoader

### Level 3 – architecture and operations

- [Live order status with subscriptions](recipes/subscriptions/README.md) – Apollo Server 5, Express 5, graphql-ws, ws, Apollo Client 4
- [Apollo Federation](recipes/federation/README.md) – Apollo Server 5, Express 5, Apollo Gateway
- [Query Cost Limits and Persisted Operations](recipes/query-cost-limits/README.md) – Apollo Server 5, Express 5
- [Response Caching with @cacheControl](recipes/response-caching/README.md) – Apollo Server 5, Express 5, Apollo response cache plugin
- [Schema Evolution](recipes/schema-evolution/README.md) – Apollo Server 5, Express 5, GraphQL Inspector
- [Tracing and Metrics](recipes/tracing/README.md) – Apollo Server 5, Express 5, OpenTelemetry
- [BFF and Domain Boundaries](recipes/bff-gateway/README.md) – Apollo Server 5, Express 5

## Workshops and slides

The exercises belong to these German-language workshops:

- [GraphQL vom Schema bis Production](https://workshops.mikebild.dev/w/graphql/onsite/)
- [GraphQL-APIs entwerfen und bauen](https://workshops.mikebild.dev/w/graphql-kompakt/online/)
- [GraphQL in 60 Minuten](https://workshops.mikebild.dev/w/mini-kurs/online/)
- [Fullstack mit TypeScript, Node.js, GraphQL und React in 6 Tagen](https://workshops.mikebild.dev/w/fullstack/onsite/)

Slides: [slides.mikebild.dev/introduction-graphql](https://slides.mikebild.dev/introduction-graphql.html)

## Resources

- [Introduction to NodeJS](https://github.com/mikebild/introduction-nodejs)
- [Introduction to React](https://github.com/mikebild/introduction-react)
- [GraphQL Resources](introduction-graphql/resources.md)

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public [GitHub issue tracker](https://github.com/mikebild/introduction-graphql/issues).

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.

## Thanks

You like this GraphQL introduction and you want to see what coming next? Follow me on Twitter [`@mikebild`](https://twitter.com/mikebild).

Enjoy!
