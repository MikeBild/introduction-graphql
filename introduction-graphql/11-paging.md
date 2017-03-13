# Paging

* Depends on paging strategy of data source
* 2 techniques are relevant
  * range based - skip / limit
  * cursor based - first / after

```graphql
{
  allAuthors(skip: 0, limit: 2) {
    name
    posts(skip: 0, limit: 2) {
      title
    }
  }
}
```