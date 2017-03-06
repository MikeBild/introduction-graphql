import React, {PropTypes} from 'react'
import { Link } from 'react-router'
import { style } from 'glamor'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import Notification from '../components/Notification'

const allPostsQuery = gql`query fetch_all_posts {
  allPosts {
    id
    title
    author {
      id
      name
    }
  }
}`

const upsertedPostSubscription = gql`
  subscription post_upserted_subscription {
    upsertedPost {
      id
      title
      author {
        id
        name
      }
    }
  }
`

const listAllPosts = props => {

  props.data.subscribeToMore({
    document: upsertedPostSubscription,
    variables: { },
    updateQuery: (previousData, { subscriptionData }) => {
      const changedPost = subscriptionData.data.upsertedPost;
      const previousDataIndex = previousData.allPosts.findIndex(x => x.id === changedPost.id);
      if(previousDataIndex === -1) previousData.allPosts.push(changedPost)
      else previousData.allPosts[previousDataIndex] = changedPost;

      Notification.success(`Post ${changedPost.id} updated!`);
      return previousData;
    },
  });

  return (
    <div>
      <div className={style(styles.header)}>
        <h3 className={style(styles.h3)}>GraphQL Example - <small>Posts</small></h3>
      </div>
      <table className={style(styles.table)}>
        <thead>
          <tr>
            <th className={style(styles.th)}><Link className={style(styles.headerLink)} to="/posts">Posts</Link></th>
            <th className={style(styles.th)}><Link className={style(styles.headerLink)} to="/authors">Authors</Link></th>            
          </tr>
        </thead>
        <tbody>
          { props.data.allPosts &&
            props.data.allPosts.map((post, i) => (
              <tr key={i}>
                <td className={style(styles.td)}><Link className={style(styles.link)} to={`/posts/${post.id}`}>{post.title}</Link></td>
                <td className={style(styles.td)}><Link className={style(styles.link)} to={`/authors/${post.author.id}`}>{post.author.name}</Link></td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}

listAllPosts.propTypes = {
  data: PropTypes.shape({
    allAuthors: PropTypes.array,
  }).isRequired
}

export default graphql(allPostsQuery, {

})(listAllPosts)

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