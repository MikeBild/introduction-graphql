import React, { Fragment } from 'react';
import { Query } from 'react-apollo';
import ArticleListQuery from './article-list-query.gql';
import List from '@introduction-graphql/list';

export default () => (
  <Fragment>
    <h1>Articles</h1>
    <Query query={ArticleListQuery}>
      {({ data: { articles = [] }, loading, error }) => {
        return (
          <List
            style={{ width: '100%' }}
            rows={articles}
            renderRow={({ id, content }) => (
              <tr key={id}>
                <td
                  style={{
                    borderBottom : '1px solid black',
                    height       : '200px',
                    maxWidth     : '400px',
                    padding      : '20px',
                  }}>
                  {content}
                </td>
              </tr>
            )}
            isLoading={loading}
            renderLoading={() => (
              <tr>
                <td>loading ...</td>
              </tr>
            )}
            renderError={(error) => (
              <tr>
                <td>{error.message}</td>
              </tr>
            )}
          />
        );
      }}
    </Query>
  </Fragment>
);
