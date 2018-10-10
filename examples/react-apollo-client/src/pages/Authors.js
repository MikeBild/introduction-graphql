import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { style } from 'glamor';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Notification from '../components/Notification';

const AllAuthorsQuery = gql`
  query fetch_all_authors {
    allAuthors {
      id
      name
      posts {
        id
        title
      }
    }
  }
`;

const FetchAuthor = gql`
  query fetch_author($id: ID!) {
    author(id: $id) {
      id
      name
      posts {
        id
        title
      }
    }
  }
`;

const UpsertAuthorMutationQuery = gql`
  mutation upsert_author($input: AuthorInput!) {
    upsertAuthor(input: $input) {
      id
    }
  }
`;

const listAllAuthors = props => {
  return (
    <div>
      <div className={style(styles.header)}>
        <h3 className={style(styles.h3)}>
          GraphQL Example - <small>Authors</small>
        </h3>
        <button
          className={style(styles.button)}
          onClick={() => Notification.input(props.upsertAuthor)}
        >
          Register Author
        </button>
      </div>
      <table className={style(styles.table)}>
        <thead>
          <tr>
            <th className={style(styles.th)}>
              <Link className={style(styles.headerLink)} to="/authors">
                Authors
              </Link>
            </th>
            <th className={style(styles.th)}>
              <Link className={style(styles.headerLink)} to="/posts">
                Posts
              </Link>
            </th>
          </tr>
        </thead>
        <tbody>
          {props.data.allAuthors &&
            props.data.allAuthors.map((author, i) => (
              <tr key={i}>
                <td className={style(styles.td)}>
                  <Link
                    className={style(styles.link)}
                    to={`/authors/${author.id}`}
                  >
                    {author.name}
                  </Link>
                </td>
                <td className={style(styles.td)}>
                  <ul className={style(styles.list)}>
                    {author.posts &&
                      author.posts.map((post, i) => (
                        <li key={i}>
                          <Link
                            className={style(styles.link)}
                            to={`/posts/${post.id}`}
                          >
                            {post.title}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

listAllAuthors.propTypes = {
  upsertAuthor: PropTypes.func.isRequired,
  data: PropTypes.shape({
    allAuthors: PropTypes.array,
  }).isRequired,
};

export default graphql(UpsertAuthorMutationQuery, {
  props: ({ mutate }) => ({
    upsertAuthor: value =>
      mutate({
        variables: { input: { id: value, name: value } },
        refetchQueries: [
          {
            query: AllAuthorsQuery,
            variables: {},
          },
        ],
      }),
  }),
})(graphql(AllAuthorsQuery)(listAllAuthors));

const styles = {
  h3: {
    color: '#ff7f00',
    textTransform: 'uppercase',
  },

  link: {
    color: '#ff7f00',
  },

  headerLink: {
    color: '#333333',
  },

  button: {
    background: 'none!important',
    color: '#ff7f00',
    textDecoration: 'underline',
    border: 'none',
    padding: '0!important',
    font: 'inherit',
    cursor: 'pointer',
  },

  list: {
    listStyleType: 'none',
  },

  header: {
    fontSize: '15px',
    textAlign: 'center',
  },

  table: {
    margin: '25px auto',
    borderCollapse: 'collapse',
    border: '1px solid #ff7f00',
    borderBottom: '2px solid #ff7f00',
  },

  th: {
    background: '#ff7f00',
    color: '#333333',
    textTransform: 'uppercase',
    fontSize: '12px',
    padding: '12px 35px',
  },

  td: {
    color: '#999',
    border: '1px solid #ff7f00',
    padding: '12px 35px',
    borderCollapse: 'collapse',
  },
};
