#!/bin/env node
const express = require('express');
const expressCors = require('cors');
const expressResponseTime = require('response-time');
const expressBodyParser = require('body-parser');
const expressGraphQL = require('express-graphql');
const expressGraphiQL = require('express-graphiql-toolbox');
const expressGraphQLSubscriptionsWebSocketTransport = require('subscriptions-transport-ws');
const loaders = require('../lib/loaders');
const schema = require('../lib/schema');
const graphqlSubscriptions = require('../lib/subscriptions')();

const app = express();
app.disable('x-powered-by');
app.use(expressResponseTime());
app.use(expressCors());
app.use(expressBodyParser.json());
app.get('/graphiql', expressGraphiQL({ endpoint: '/graphql' }));
app.use(
  '/graphql',
  expressGraphQL(req => ({
    schema: schema,
    rootValue: {},
    graphiql: false,
    context: { user: { id: (req.user || {}).id }, loaders: loaders() },
  })),
);

const httpServer = app.listen(process.env.SERVICE_PORT, () =>
  console.log(
    `GraphQL-Service (HTTP + WebSocket) listen on ${httpServer.address().port}`,
  ),
);
const subscriptionWebSocketsServer = new expressGraphQLSubscriptionsWebSocketTransport.SubscriptionServer(
  {
    onSubscribe: (msg, params) =>
      Object.assign({}, params, { context: { loaders: loaders() } }),
    subscriptionManager: graphqlSubscriptions.subscriptionManager,
  },
  { server: httpServer, path: '/graphql' },
);

function authenticate(req, res, next) {
  const authHeader = req.get('Authorization') || req.get('authorization') || '';
  const token = authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  req.user = { id: token };
  next();
}
