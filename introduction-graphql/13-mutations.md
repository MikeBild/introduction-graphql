# GraphQL Mutations

- Mutations are like queries
- Request/Response model
- Support for Scalar- or Input-Types
- Custom payload types as response

## Schema

```graphql
type Author {
  id: ID
  rev: ID
  name: String
  posts: [Post]
}

input AuthorInput {
  id: ID
  rev: ID
  name: String
}

type Mutation {
  upsertAuthor(input: AuthorInput!): Author
  removeAuthor(input: AuthorInput!): ID
}
```

## Upsert author mutation query

```graphql
mutation {
  upsertAuthor(input: { name: "Test" }) {
    id
    rev
    name
  }
}
```

## Remove author mutation query

```graphql
mutation {
  removeAuthor(input: { id: "...", rev: "..." })
}
```
