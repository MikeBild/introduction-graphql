# Query Directives

## Included Directives

- `include` - do query if
- `skip` - don't query if

## Custom Directives

- depending on GraphQL framework

## Example

```graphql
query skip_query($isSome: Boolean!) {
  allAuthors {
    name
    posts @skip(if: $isSome) {
      id
    }
  }
}

query include_query($isSome: Boolean!) {
  allAuthors {
    name
    posts @include(if: $isSome) {
      id
    }
  }
}
```

```json
{
  "isSome": true
}
```
