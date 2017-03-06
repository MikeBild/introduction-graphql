import React, {PropTypes} from 'react'
import { Link } from 'react-router'
import { style } from 'glamor'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const fetchPostQuery = gql`query fetch_post($id: ID!) {
  post(id: $id) {
    id
    title
    text
    author {
      id
      name
    }
  }
}`

const fetchPost = props => {
  return (
    <div>
      <div className={style(styles.header)}>
        <h3 className={style(styles.h3)}>GraphQL Example - <small>Post</small></h3>
      </div>
      <table className={style(styles.table)}>
        <thead>
          <tr>
            <th className={style(styles.th)}><Link className={style(styles.headerLink)} to="/posts">Posts</Link></th>
            <th className={style(styles.th)}><Link className={style(styles.headerLink)} to="/authors">Authors</Link></th>            
          </tr>
        </thead>
        <tbody>
          { props.data.post &&            
              <tr>
                <td className={style(styles.td)}>
                  <div><label><strong>Title </strong></label><Link className={style(styles.link)} to={`/posts/${props.data.post.id}`}>{props.data.post.title}</Link></div>
                  <div><label><strong>Text </strong></label><span>{props.data.post.text}</span></div>
                </td>
                <td className={style(styles.td)}><Link className={style(styles.link)} to={`/authors/${props.data.post.author.id}`}>{props.data.post.author.name}</Link></td>
              </tr>
          }
        </tbody>
      </table>
    </div>
  )
}

fetchPost.propTypes = {
  data: PropTypes.shape({
    post: PropTypes.object,
  }).isRequired
}

export default graphql(fetchPostQuery, {
  options: ({ params: { id } }) => ({ 
      pollInterval: 5000,
      variables: {
          id: id
      },
    }),
})(fetchPost)

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