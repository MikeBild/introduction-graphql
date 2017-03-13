# Error Handling

* Special Error responses as collection
* Catches thrown errors from resolvers

## Example

```javascript
doSomthing: (source, args, context, info) => Promise.reject(new Error('An error'))
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
      "path": [
        "doSomthing"
      ]
    }
  ]
}
```
