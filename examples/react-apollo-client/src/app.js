import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import {
  SubscriptionClient,
  addGraphQLSubscriptions,
} from 'subscriptions-transport-ws';
import { ApolloProvider } from 'react-apollo';
import './style.css';
import Authors from './pages/Authors';
import Posts from './pages/Posts';
import Post from './pages/Post';
import Author from './pages/Author';

const httpClient = createNetworkInterface({
  uri: `http://${process.env.GRAPHQL_HOST}/graphql`,
});
const wsClient = new SubscriptionClient(
  `ws://${process.env.GRAPHQL_HOST}/graphql`,
  { reconnect: true, connectionParams: {} },
);
const apolloClient = new ApolloClient({
  networkInterface: addGraphQLSubscriptions(httpClient, wsClient),
});

render(
  <ApolloProvider client={apolloClient}>
    <Router history={browserHistory}>
      <Route path="/">
        <IndexRoute component={Posts} user="John Doe" />
        <Route path="authors" component={Authors} user="John Doe" />
        <Route path="posts" component={Posts} user="John Doe" />
        <Route path="posts/:id" component={Post} user="John Doe" />
        <Route path="authors/:id" component={Author} user="John Doe" />
      </Route>
    </Router>
  </ApolloProvider>,
  document.getElementById('root'),
);
