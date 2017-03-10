# Fragments

* Prepare and reuse queries

## Example

### GraphQL-Query uses fragment (...)

```graphql
query all_authors_query {
  allAuthors {
    name
    posts {
      ...post
    }
  }
}

query author_query {
  author(id: "John Doe") {
    name
    posts {
      ...post
    }
  }
}
```

### GraphQL named fragment

```graphql
fragment post on Post {
  title
}
```