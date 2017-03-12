# Variables

* Special field in request
* JSON structure

## Example

### GraphQL-Query uses variables ($)

```graphql
query author_query($id: ID!) {
  author(id: $id) {
    name
  }
}
```

### Variables as JSON

```json
{
    "id": "..."
}
```