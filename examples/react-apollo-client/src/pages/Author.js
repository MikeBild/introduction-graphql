import React, {PropTypes} from 'react'
import { Link } from 'react-router'
import { style } from 'glamor'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const fetchAuthorQuery = gql`query fetch_author($id: ID!) {
  author(id: $id) {
    id
    name
    posts {
      id
      title
    }
  }
}`

const fetchAuthor = props => {
  return (
    <div>
      <div className={style(styles.header)}>
        <h3 className={style(styles.h3)}>GraphQL Example - <small>Author</small></h3>
      </div>
      <table className={style(styles.table)}>
        <thead>
          <tr>
            <th className={style(styles.th)}><Link className={style(styles.headerLink)} to="/authors">Authors</Link></th>
            <th className={style(styles.th)}><Link className={style(styles.headerLink)} to="/posts">Posts</Link></th>
          </tr>
        </thead>
        <tbody>
          { props.data.author &&            
              <tr>
                <td className={style(styles.td)}><Link className={style(styles.link)} to={`/authors/${props.data.author.id}`}>{props.data.author.name}</Link></td>
                <td className={style(styles.td)}>
                    <ul className={style(styles.list)}>
                      { props.data.author.posts &&
                        props.data.author.posts.map((post, i) => 
                          <li key={i}><Link className={style(styles.link)} to={`/posts/${post.id}`}>{post.title}</Link></li>
                        )
                      }
                    </ul>
                </td>
              </tr>
          }
        </tbody>
      </table>
    </div>
  )
}

fetchAuthor.propTypes = {
  data: PropTypes.shape({
    author: PropTypes.object,
  }).isRequired
}

export default graphql(fetchAuthorQuery, {
  options: ({ params: { id } }) => ({ 
      pollInterval: 5000,
      variables: {
          id: id
      },
    }),
})(fetchAuthor)

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

  list: {
    listStyleType: 'none',
  },

  header: {
    fontSize: '15px',
    textAlign: 'center'
  },

  table: {
    margin: '25px auto',
    borderCollapse: 'collapse',
    border: '1px solid #ff7f00',
    borderBottom: '2px solid #ff7f00'
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
    borderCollapse: 'collapse'
  },

}