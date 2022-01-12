# Paging

- Depends on paging strategy of data source
- 2 techniques are relevant
  - range based - skip / limit
  - cursor based - first / after
- Connection model

## Range based

```graphql
{
  authors(skip: 0, limit: 2) {
    name
    posts(skip: 0, limit: 2) {
      title
    }
  }
}
```

## Cursor based

```graphql
{
  authors(after: 99, take: 2) {
    name
    posts(after: 99, take: 2) {
      title
    }
  }
}
```

## Connection Model

**https://relay.dev/graphql/connections.htm**

```graphql
{
  authors(first:2, after: 99) {
    totalCount
    edges {
      node {
        name
      }
      cursor
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
```