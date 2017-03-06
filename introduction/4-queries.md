# GraphQL Queries

![Queries](queries.png)

* One endpoint (GET/POST)
* Hierarchically structured
* Like JSON without JSON values
* Queries, Mutations and Subscriptions
* Support for Query-Variables
* Query validation support

```graphql
{
  allAuthors {
    id
    name
  }
}
```

__Named query__
```graphql
query fetch_all_authors {
  allAuthors {
    id
    name
  }
}
```

__Aliasing__
```graphql
{
  authors: allAuthors {
    id
    name
  }
}
```
