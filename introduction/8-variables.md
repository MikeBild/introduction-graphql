# Variables

* Special field in request
* JSON structure

```graphql
query author_query($id: ID!) {
  author(id: $id) {
    name
  }
}
```

```json
{
    "id": "..."
}
```