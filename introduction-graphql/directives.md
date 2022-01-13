# Query Directives

- schema directives 
- operation/execuatable directives
- custom schema directives
## Default operation/execuatable directives

- `@include` - do query if
- `@skip` - don't query if^


```graphql
query skip_query($isSome: Boolean!) {
  allAuthors {
    name
    posts @skip(if: $isSome) {
      id
    }
  }
}

query include_query($isSome: Boolean!) {
  allAuthors {
    name
    posts @include(if: $isSome) {
      id
    }
  }
}
```

```json
{
  "isSome": true
}
```

## Default schema directives

- `@deprecated` - mark field as deprecated

## Custom schema directives

```graphql
directive @upper on FIELD_DEFINITION
```

```javascript
const { ApolloServer, SchemaDirectiveVisitor } = require("apollo-server");
const { defaultFieldResolver } = require("graphql");

class CustomDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function ([source, params, context, info]) {
      return {...};
    };
  }
}


const server = new ApolloServer({
  schemaDirectives: {
    upper: CustomDirective,
  },
  typeDefs,
});
```
