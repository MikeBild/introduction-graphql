# GraphQL Errors

- separate between technical errors and business failures
- technical errors will be handles in resolvers and the HTTP runtime
- business errors should explicit designed as interface or union types

## Business error handling

- Define as union type

## Technical error handling

- Special error responses as collection
- Catches thrown errors from resolvers

```javascript
doSomthing: (source, args, context, info) =>
  Promise.reject(new Error('An error'));
```

```json
{
  "data": {
    "doSomthing": null
  },
  "errors": [
    {
      "message": "An error",
      "locations": [
        {
          "line": 1,
          "column": 2
        }
      ],
      "path": ["doSomthing"]
    }
  ]
}
```
