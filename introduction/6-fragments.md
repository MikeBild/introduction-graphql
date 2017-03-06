# Fragments

* Prepare and reuse queries

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


fragment post on Post {
  title
}
```