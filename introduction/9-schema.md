# GraphQL Schema

* GraphQL Schema- and Type-Language (Short-Hand Notation)
* Similar to GraphQL Query-Language
* Build in Scalar-Types (Int, String, Boolean, ID, Float)
* Custom types via Type-Language
* Enums, Unions, Interfaces, Lists, Non-Null
* `@` to mark as deprecated 
* `#` for custom documentations
* Query, Mutation and Subscription are special types
* Exclicit Input-Type definitions

```graphql
type Author {
  id: ID
  rev: String
  fullname: String @deprecated(reason: "Use the 'name' field instead")
  name: String
  # Posts written by current author
  posts: [Post]
}

type Post {
  id: ID
  rev: String
  title: String
  text: String
  authorId: ID
  # Current author of post
  author: Author
}

type Query {
  # Query author by ID
  author(id: ID!): Author
  # Query all authors
  allAuthors: [Author]
}
```
