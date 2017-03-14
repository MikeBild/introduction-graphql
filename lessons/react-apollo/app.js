import React, { PropTypes } from 'react'
import { render } from 'react-dom'
import { ApolloProvider, ApolloClient, createNetworkInterface } from 'react-apollo'
import { gql, graphql } from 'react-apollo'

const client = new ApolloClient({
  networkInterface: createNetworkInterface({ uri: 'http://localhost:8888/graphql' }),
})

const doSomething = props => {
  props.mutate({ variables: { input: 'Hello World' } })
  .then(({data}) => alert(`got data ${data.doSomething}`))
  .catch(error => alert('there was an error sending the query', error));
}

const MyComponent = props => (
  <div>
    <h1>Simple GraphQL query result with React + Apollo</h1>
    <button onClick={() => doSomething(props)}>Do something!</button>
    <pre>
      {JSON.stringify(props, null, 4)}
    </pre>
  </div>
)

MyComponent.propTypes = {
  mutate: PropTypes.func.isRequired,
}

const MyQuery = gql`query MySimpleQuery { search(term: "Hello World!") { content } }`
const MyComponentWithData = graphql(MyQuery)(MyComponent)

const MyMutation = gql`mutation MySimpleMutation($input: String) { doSomething(input: $input) }`
const MyComponentWithMutation = graphql(MyMutation)(MyComponent)

const MyComponentWithDataAndMutation = graphql(MyQuery)(graphql(MyMutation)(MyComponent))

render(
  <ApolloProvider client={client}>
    <MyComponentWithDataAndMutation />
  </ApolloProvider>,
  document.getElementById('root')
)