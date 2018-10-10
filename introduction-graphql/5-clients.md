# Clients

- Query Tools e.g. GraphiQL, GraphiQL APP, etc.
- Every HTTP Client e.g. cURL, Postman, fetch, etc.
- JavaScript Client-Libraries e.g. [Apollo](http://dev.apollodata.com/), [Relay](https://github.com/facebook/relay), [Lokka](https://github.com/kadirahq/lokka), etc.
- Web/Mobile Platform specific e.g. Obj-C, F# Type-Provider, etc.

## Examples

### cURL

```bash
curl -s -XPOST "http://localhost:8080/graphql" \
    -H "Content-Type: application/json" \
    -d '{ "query":"{allAuthors{name}}", "variables":"{}" }' | jq .
```
