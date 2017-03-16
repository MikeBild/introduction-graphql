# Subscriptions

## Setup for Apollo-Client

```bash
npm install --save subscriptions-transport-ws
```

## Subscription connection via WebSocket transport

```javascript
import ApolloClient, { createNetworkInterface } from 'apollo-client'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'

const httpClient = createNetworkInterface({uri: `http://localhost:8080/graphql`})
const wsClient = new SubscriptionClient(`ws://localhost:8080/graphql`, { reconnect: true })
const apolloClient = new ApolloClient({ networkInterface: addGraphQLSubscriptions(httpClient, wsClient) });

render (
  <ApolloProvider client={apolloClient}>
  </ApolloProvider>
)
```

## Using subscription query in components

```javascript
const upsertedPostSubscriptionQuery = gql`
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

componentWillMount() {
  props.data.subscribeToMore({
    document: upsertedPostSubscriptionQuery,
    variables: { },
    updateQuery: (previousData, { subscriptionData }) => {
      const result = clonedeep(previousData);
      const changedPost = subscriptionData.data.upsertedPost;
      const previousDataIndex = previousData.allPosts.findIndex(x => x.id === changedPost.id);

      if(previousDataIndex === -1) result.allPosts.push(changedPost)
      else result.allPosts[previousDataIndex] = changedPost

      Notification.success(`Post ${changedPost.id} updated!`);
      return result;
    },
  });
}
```
