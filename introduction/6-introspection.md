## Introspection

* Query-Type 
* Metadata of Type-System, Queries, Mutations and Subscriptions

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