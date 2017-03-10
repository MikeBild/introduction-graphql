# GraphQL Queries

![Queries](queries.png)

* One endpoint (GET/POST)
* Hierarchically structured
* Like JSON without JSON values
* Queries, Mutations and Subscriptions
* Support for Query-Variables
* Query validation support

## Example

### Simple Query

```graphql
{
  allAuthors {
    id
    name
  }
}
```

### Named Query

```graphql
query fetch_all_authors {
  allAuthors {
    id
    name
  }
}
```

### Alias

```graphql
{
  authors: allAuthors {
    id
    name
  }
}
```
