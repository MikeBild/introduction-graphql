const express = require('express');
const expressCORS = require('cors');
const expressGraphQL = require('express-graphql');
const schema = require('../graphql-runtime-schema/schema');

const app = express();
app.use(expressCORS());
app.use('/graphql', expressGraphQL({
  schema: schema,
  graphiql: true,
  pretty: true,
}));

let server = undefined;
module.exports = () => ({
  start: ({port}) => new Promise(resolve => server = app.listen(port, () => resolve(server))),
  stop: () => new Promise(resolve => server.close(() => resolve())),
});