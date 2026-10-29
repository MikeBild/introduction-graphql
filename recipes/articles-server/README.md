# Articles: a first GraphQL Yoga server

A newsroom API with articles and authors, in TypeScript strict on GraphQL Yoga. The schema lives in its own SDL file (`src/schema.graphql`), the resolvers in `src/yoga.ts`, the data in `src/data.ts`. It replaces the old Apollo Server 2 example, which is kept for comparison in [`legacy/apollo-example/packages/server`](../../legacy/apollo-example/packages/server).

Writing needs a token in the header `authorization: Bearer …`: `token-ada` (author `a-1`) or `token-grace` (author `a-2`).

The exercises build on each other. Work through them in order, in `src/`.

## Setup

```sh
npm install
npm test
npm start            # GraphiQL on http://localhost:4000/graphql
```

## Exercise 1: First server

1. Compare `src/yoga.ts` with the Apollo Server 2 version in `legacy/apollo-example/packages/server/lib`: where did the schema, the resolvers and the context go?
2. Run `npm test`: `Query.articles` has no resolver yet, so the non-null list fails – and Yoga masks the internal error message.
3. Write the resolver for `Query.articles` (newest first) and send the query in GraphiQL and with `curl`:

   ```sh
   curl -s localhost:4000/graphql -H 'content-type: application/json' \
     -d '{"query":"{ articles { id title state } }"}'
   ```

## Exercise 2: SDL basics

Read `src/schema.graphql` and add a type `Author` with non-null fields `id` and `name`, a list `articles: [Article!]!`, a field `Article.author: Author!` and a query `author(id: ID!): Author`. Implement the resolvers. Which nullability did you pick for each field, and why?

## Exercise 3: Mutations with input types

`articleAdd` shows the pattern: a business action with its own input type and a payload that returns the changed object. Add `articlePublish(input: ArticlePublishInput!): ArticlePublishPayload!` the same way. Only the author of the article may publish it (`FORBIDDEN` otherwise).

## Exercise 4: Testing with Vitest and yoga.fetch

Write tests that send real HTTP requests through `yoga.fetch` – no port, no network: the query `articles`, and `articleAdd` without a token (`UNAUTHENTICATED`, status 200, `data: null`). What status does a request with invalid variables get?

## Solution

`solution/` contains a possible solution for all four exercises: `npm run start:solution`.
