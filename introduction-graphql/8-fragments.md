# Fragments

* Prepare and reuse queries like React-Components
* Fragment per Component in mind
  * `<Post />` component is associated with Post-Fragment
  * `<Author />` component is associated with Author-Fragment

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
    ...author
  }
}
```

### GraphQL named fragment

```graphql
fragment post on Post {
  title
}

fragement author on Author {
  name
  posts {
    ...post
  }
}
```