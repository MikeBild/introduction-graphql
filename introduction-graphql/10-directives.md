# Directives

* `include` - do query if
* `skip` - don't query if

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