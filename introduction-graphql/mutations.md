# GraphQL Mutations

- Allow to perform updates
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
  authorUpsert(input: AuthorInput!): Author
  authorRemove(input: AuthorInput!): ID
}
```

## Upsert author mutation query

```graphql
mutation AuthorUpsert($input: AuthorInput!) {
  authorUpsert(input: $input) {
    id
    rev
    name
    posts {
      id
    }
  }
}
```

```json
{ 
  "input": { "name": "Test" }
}
```

## Remove author mutation query

```graphql
mutation {
  removeAuthor(input: { id: "...", rev: "..." })
}
```
