# Query Variables

- Supports default values
- Special field in request
- JSON structure

## Examples

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

## Default values

```graphql
query author_query($id: ID = 1) {
  author(id: $id) {
    name
  }
}
```