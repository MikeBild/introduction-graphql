# Queries

- `ApolloClient.watchQuery` is used under the hood
- results are passed to prop called `data`
- field `data.loading` indicating load from server
- field `data.error` represents possible errors
- additional methods `data.refetch()`, `data.fetchMore()`, etc.

## Basics

```javascript
import React from 'react';
import { gql, graphql } from 'react-apollo';

const MyComponent = props => (
  <div>{props.data && props.data.search && props.data.search.content}</div>
);

const MyQuery = gql`
  query fetch($term: String) {
    search(term: "hello world") {
      content
    }
  }
`;

export default graphql(MyQuery)(MyComponent);
```

## Query options

### Variables

```javascript
export default graphql(MyQuery, {
  options: {
    variables: { term: 'Hello World!' },
  },
})(MyComponent);
```

```javascript
<SearchWithData term="Hello World" />;

export default graphql(MyQuery, {
  options: ownProps => ({
    variables: { term: ownProps.term },
  }),
})(MyComponent);
```

### Polling

```javascript
export default graphql(MyQuery, {
  options: { pollInterval: 20000 },
})(MyComponent);
```

### Skipping an operation

```javascript
export default graphql(MyQuery, {
  skip: ownProps => !ownProps.authenticated,
})(MyComponent);
```

### Controlling `props` of compoent

- props passed to child sare available via `ownProps`

```javascript
export default graphql(MyQuery, {
  props: (ownProps, data) => ({ ...ownProps, ...data }),
})(MyComponent);
```
