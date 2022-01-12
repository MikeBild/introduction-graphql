# GraphQL Types

- Build-In Scalar Types

  - ID (identity value)
  - String
  - Int
  - Float
  - Boolean

- Special Custom Types

  - Enums
  - Scalar
  - Input

- Type modifiers
  - Collections `[]`
  - Non-Null `!`

- Build-In Abstract Types to group other types

  - Interface
  - Union

## Scala

```graphql
scalar Date
```

## Collections

```graphql
[Articles]
```


## Enums

```graphql
enum PostType {
  ARTICLE
  COMMENT
}
```

## Inputs

```graphql
input ArticleAddInput {
  content: String!
  authorId: ID!
}
```

