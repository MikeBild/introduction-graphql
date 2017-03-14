# Mutations

* Working like queries
* calling mutations with `props.mutate({variables: {}})`

## Basics

```javascript
import React, { PropTypes } from 'react'
import { gql, graphql } from 'react-apollo'

const doSomething = props => {
  props.mutate({ variables: { input: 'Hello World' } })
  .then(({data}) => alert(`got data ${data.doSomething}`))
  .catch(error => alert('there was an error sending the query', error));
}

const MyComponent = props => (
  <button onClick={() => doSomething(props)}>Do something!</button>
)

MyComponent.propTypes = {
  mutate: PropTypes.func.isRequired,
}

const MyMutation = gql`
  query do_something_mutation ($input: String) {
    doSomething(input: $input)
  }
`

export default graphql(MyMutation)(MyComponent)
```