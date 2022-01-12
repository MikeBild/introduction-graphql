# Authentication and Authorization

- Auth information via HTTP header
- Passed through context
- Custom GraphQL directives (e.g. @auth)

```javascript
new ApolloServer({
    context: ({ req }) => ({
        userToken: req.headers.authorization || "",
    }),
});
```

```graphql
enum Role {
  ADMIN
  OWNER
  USER
}

directive @auth(
  requires: Role!,
) on FIELD_DEFINITION

type User {
  id: ID
  email: String
  role: String @auth(requires: ADMIN)
}

type Query {
  me: User @auth(requires: USER)
}
```