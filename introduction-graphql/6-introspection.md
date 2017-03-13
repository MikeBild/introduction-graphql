# Introspection

* Is a special Query-Type
* Metadata of Type-System, Queries, Mutations and Subscriptions

## Example

```graphql
{
  __schema {
    types {
      kind
      name
      description
      fields {
        name
      }
    }
  }
}
```