# GraphQL Query Resolver

![Resolver Execution Flow](resolver-execution-flow.png)

* Functions to resolve types and fields in GraphQL schema
* Context, Arguments, Parent as Parameters
* Executed in a Top-Down execution flow via Visitor Pattern
* Sync/Async execution
* Can connected to various backends

## Resolver Arguments

* First argument __source__ - Parent object of object tree
* Second argument __args__ - Field arguments in query
* Third argument __context__ - Request specific context object
* Fourth argument __info__ - Information about the GraphQL execution state

## Resolve with Promises

```javascript
(source, args, context, info) => {
    return new Promise((resolve, reject) => {
        ...
        resolve({}) / reject(new Error(...))
    })
}
```