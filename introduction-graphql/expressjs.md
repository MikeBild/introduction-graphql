# GraphQL with ExpressJS

- Easy to use GraphQL with ExpressJS
- Exposes a HTTP(S) endpoint
- GraphiQL Tools are included
- Express Middleware for Authentication/Authorisation, CORS, WebSockets, etc.

## Example

```javascript
const express = require('express');
const expressGraphQL = require('express-graphql');
const schema = require('./schema');
const app = express();

app.use(
  '/graphql',
  expressGraphQL({
    schema: schema,
    graphiql: true,
  }),
);

app.listen(8787, () => console.log('GraphQL-Server listen on 8787'));
```
