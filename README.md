# Introduction to GraphQL

## Recommendations

- Basic knowledge of
  - JavaScript/TypeScript
  - NodeJS
  - React
- Node.js 26 or newer (the recipes run TypeScript directly and test with Vitest)
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
- [Legacy: Apollo Server 2 and React 17 example](legacy/apollo-example/README.md) – replaced by the articles recipes below

## Exercises

Runnable recipes, from easy to hard. `src/` is the starting point, `solution/` a possible solution, the README holds the exercise. Node.js 26 or newer; in each folder `npm ci`, `npm test` (Vitest) and `npm run typecheck`. Node.js servers run on Express 5.

### Level 1 – basics

- [REST vs. GraphQL](recipes/rest-vs-graphql/README.md) – GraphQL Yoga
- [Articles: a first Apollo Server on Express (SDL, mutations, testing)](recipes/articles-server/README.md) – Apollo Server 5, Express 5
- [Operations: Variables, Fragments, Aliases](recipes/operations-fragments/README.md) – GraphQL Yoga
- [Resolvers without N+1: DataLoader](recipes/dataloader/README.md) – Apollo Server 5, Express 5, DataLoader
- [Errors as Data](recipes/errors-as-data/README.md) – GraphQL Yoga

### Level 2 – everyday practice

- [Articles: a React client with Apollo Client 4 and Codegen](recipes/articles-client/README.md) – React 19, Apollo Client 4, GraphQL Codegen
- [Authentication and Authorization](recipes/auth/README.md) – Apollo Server 5, Express 5
- [Pagination with Connections and Apollo cache policies](recipes/pagination/README.md) – Apollo Server 5, Express 5, Apollo Client 4
- [Optimistic UI with the Apollo Client cache](recipes/optimistic-ui/README.md) – Apollo Server 5, Express 5, Apollo Client 4
- [Custom Scalars](recipes/custom-scalars/README.md) – GraphQL Yoga
- [Wrapping REST](recipes/rest-wrapping/README.md) – GraphQL Yoga

### Level 3 – architecture and operations

- [Apollo Federation](recipes/federation/README.md) – Apollo Server 5, Express 5, Apollo Gateway
- [Query Cost Limits and Persisted Operations](recipes/query-cost-limits/README.md) – GraphQL Yoga
- [Response Caching](recipes/response-caching/README.md) – GraphQL Yoga
- [Schema Evolution](recipes/schema-evolution/README.md) – GraphQL Yoga
- [Tracing and Metrics](recipes/tracing/README.md) – GraphQL Yoga
- [BFF and Domain Boundaries](recipes/bff-gateway/README.md) – GraphQL Yoga

## Resources

- [Introduction to NodeJS](https://github.com/mikebild/introduction-nodejs)
- [Introduction to React](https://github.com/mikebild/introduction-react)
- [GraphQL Resources](introduction-graphql/resources.md)
- [Apollo Resources](introduction-apollo/resources.md)

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public [GitHub issue tracker](https://github.com/mikebild/introduction-graphql/issues).

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.

## Thanks

You like this GraphQL introduction and you want to see what coming next? Follow me on Twitter [`@mikebild`](https://twitter.com/mikebild).

Enjoy!
