# Introspection

- Is a special Query-Type
- Metadata of Type-System, Queries, Mutations and Subscriptions

## Example

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

## Fetching remote GraphQL schema

```javascript
const GRAPHQL_URL = 'http://localhost:8080/graphql';
const GRAPHQL_USERNAME = 'username';
const GRAPHQL_PASSWORD = 'password';

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const GraphQLUtils = require('graphql/utilities');

console.log(`Fetching GraphQL schema from ${GRAPHQL_URL}`);

fetch(GRAPHQL_URL, {
  method: 'POST',
  headers: {
    authorization: `Basic ${Buffer.from(
      `${GRAPHQL_USERNAME}:${GRAPHQL_PASSWORD}`,
    ).toString('base64')}`,
    'content-type': 'application/json',
  },
  body: JSON.stringify({ query: GraphQLUtils.introspectionQuery }),
})
  .then(res => res.text())
  .then(data => fs.writeFileSync(path.join(__dirname, 'schema.json'), data))
  .then(() => console.log('GraphQL schema written.'))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

## ESLint GraphQL schema validation

- adjust your .eslintrc / package.json for GraphQL schema validation

```json
"rules": {
  "graphql/template-strings": [
    "error",
    {
      "env": "apollo",
      "schemaJsonFilepath": "./scripts/schema.json"
    }
  ],
},
```

## Introspection query via curl

```sh
curl -i -X POST http://localhost:8080/graphql -H "Content-Type: application/json" -d @introspection_query.json
```

**introspection_query.json**
```json
{ 
  "query": "query IntrospectionQuery {
      __schema {
        queryType { name }
        mutationType { name }
        subscriptionType { name }
        types {
          ...FullType
        }
        directives {
          name
          description
          locations
          args {
            ...InputValue
          }
        }
      }
    }

    fragment FullType on __Type {
      kind
      name
      description
      fields(includeDeprecated: true) {
        name
        description
        args {
          ...InputValue
        }
        type {
          ...TypeRef
        }
        isDeprecated
        deprecationReason
      }
      inputFields {
        ...InputValue
      }
      interfaces {
        ...TypeRef
      }
      enumValues(includeDeprecated: true) {
        name
        description
        isDeprecated
        deprecationReason
      }
      possibleTypes {
        ...TypeRef
      }
    }

    fragment InputValue on __InputValue {
      name
      description
      type { ...TypeRef }
      defaultValue
    }

    fragment TypeRef on __Type {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                  }
                }
              }
            }
          }
        }
      }
    }"
}
```
