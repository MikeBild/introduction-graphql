# GraphQL Mutations

* Mutations are like queries
* Request/Response model
* Support for Scalar- or Input-Types
* Custom payload types as response

__Schema__
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

__Upsert author mutation query__
```graphql
mutation {
  upsertAuthor(input: { name: "Test" }) {
    id
    rev
    name
  }
}
```
__Remove author mutation query__
```graphql
mutation {
  removeAuthor(input: {id: "...", rev: "..."})
}
```