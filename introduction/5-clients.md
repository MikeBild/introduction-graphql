# Clients

* Query Tools e.g. GraphiQL, GraphiQL APP, etc.
* Every HTTP Client e.g. cURL, Postman, fetch, etc.
* JavaScript Client-Library e.g. Apollo, Relay, Lokka, etc.
* Platform specific e.g. Obj-C, F# Type-Provider, etc.

```bash
curl -s -XPOST "http://localhost:8080/graphql" \
    -H "Content-Type: application/json" \
    -d '{ "query":"{allAuthors{name}}", "variables":"{}" }' | jq .
```