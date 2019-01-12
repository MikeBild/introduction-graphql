# Why GraphQL

## Restfullness

`GET /users/1/friends/1/dogs/1?include=user.name,dog.age`

Current APIs are:

- Mostly Resource-based (CRUD)
- Sometimes a JSON/RPC over HTTP(S)
- Mostly not well documented
- Doesn't have an explorative UI
- Mostly producer (Backend/Data) driven
- Versioning is difficult
- Expose untyped/schemaless contracts
- Dynamic Queries is hard to implement
- Needs explicit query validation
- Chatty Relation-Traversals (link rel traversal)
- Growing REST / Hypermedia APIs are complex
- Increases the effort for multiple representations (e.g. Desktop/Web/Mobile)
- Inconsistent REST/Hypermedia [Maturity Model](https://martinfowler.com/articles/richardsonMaturityModel.html)
- Sometimes obsure resource naming, relations and operations

## Who using GraphQL

[GraphQL Users](http://graphql.org/users/)
