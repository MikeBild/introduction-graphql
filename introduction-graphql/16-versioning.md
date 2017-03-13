# Versioning

* Add new types, properties and resolver
* `#` to mark "old stuff" as deprecated
* Resolver returns null

## Example

### Mark as deprecated (@)

```graphql
type Author {
  id: ID
  rev: String
  fullname: String @deprecated(reason: "Use the 'name' field instead")
  name: String
}
```