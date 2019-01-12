import React from 'react';
import { storiesOf, addDecorator } from '@storybook/react';
import { withKnobs, text, object } from '@storybook/addon-knobs';
import apolloStorybookDecorator from 'apollo-storybook-react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import List from '@introduction-graphql/list';

const ArticleListQuery = gql`
  query ArticleList {
    articles {
      id
      content
    }
  }
`;

storiesOf('Components', module)
  .addDecorator(withKnobs)
  .addDecorator(
    apolloStorybookDecorator({
      apolloLinkOptions : { delayMs: 2000 },
      typeDefs          : `
    type Query {
      articles: [Article]
      article(id: ID!): Article
    }

    type Article {
      id: ID!
      authorId: ID
      content: String
    }
    `,
      mocks             : {},
    })
  )
  .add('List', () => (
    <Query query={ArticleListQuery}>
      {({ data: { articles = [] }, loading }) => (
        <List
          rows={object('rows', articles)}
          renderHeadRow={() => (
            <tr>
              <th>ID</th>
              <th>Content</th>
            </tr>
          )}
          renderRow={({ id, content }) => (
            <tr key={id}>
              <td>{id}</td>
              <td>{content}</td>
            </tr>
          )}
          isLoading={loading}
          renderLoading={() => (
            <tr>
              <td colSpan={2}>loading ...</td>
            </tr>
          )}
        />
      )}
    </Query>
  ));
