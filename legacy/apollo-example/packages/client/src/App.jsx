import React from 'react';
import graphqlConfig from './graphql-config.json';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import ArticleList from './components/pages/ArticleList';

const client = new ApolloClient({
  uri : graphqlConfig.url,
});

export default () => (
  <ApolloProvider client={client}>
    <ArticleList />
  </ApolloProvider>
);
