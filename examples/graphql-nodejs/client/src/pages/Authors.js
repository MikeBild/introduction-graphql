import React, {PropTypes} from 'react'
import { Link } from 'react-router'
import { style } from 'glamor'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const allAuthorsQuery = gql`query all_authors {
  allAuthors {
    id
    name
    posts {
      id
      title
    }
  }
}`

const listAllAuthors = props => {
  return (
    <div>
      <div className={style(styles.header)}>
        <h3 className={style(styles.h3)}>GraphQL Example - <small>Authors</small></h3>
      </div>
      <table className={style(styles.table)}>
        <thead>
          <tr>
            <th className={style(styles.th)}><Link className={style(styles.headerLink)} to="/authors">Authors</Link></th>
            <th className={style(styles.th)}><Link className={style(styles.headerLink)} to="/posts">Posts</Link></th>
          </tr>
        </thead>
        <tbody>
          { props.data.allAuthors &&
            props.data.allAuthors.map((author, i) => (
              <tr key={i}>
                <td className={style(styles.td)}><Link className={style(styles.link)} to={`/authors/${author.id}`}>{author.name}</Link></td>
                <td className={style(styles.td)}>
                    <ul className={style(styles.list)}>
                      { author.posts &&
                        author.posts.map((post, i) => 
                          <li key={i}><Link className={style(styles.link)} to={`/posts/${post.id}`}>{post.title}</Link></li>
                        )
                      }
                    </ul>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}

listAllAuthors.propTypes = {
  data: PropTypes.shape({
    allAuthors: PropTypes.array,
  }).isRequired
}

export default graphql(allAuthorsQuery, {
  options: { pollInterval: 5000 },
})(listAllAuthors)

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