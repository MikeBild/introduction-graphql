# Versioning

- Add new types, properties and resolver
- `@deprecated` to mark "old stuff" as deprecated
- Resolver returns null

## Example

```graphql
type Author {
  id: ID
  rev: String
  fullname: String @deprecated(reason: "Use the 'name' field instead")
  name: String
}
```
