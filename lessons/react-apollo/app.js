import React from 'react'
import { render } from 'react-dom'
import { ApolloProvider, ApolloClient, createNetworkInterface } from 'react-apollo'
import { gql, graphql } from 'react-apollo'

const client = new ApolloClient({
  networkInterface: createNetworkInterface({ uri: 'http://localhost:8888/graphql' }),
})

const MyComponent = props => (
  <div>
    <h1>Simple GraphQL query result with React + Apollo</h1>
    <pre>
      {JSON.stringify(props, null, 4)}
    </pre>
  </div>
)

const MyQuery = gql`query MySimpleQuery { search(term: "some example content") { content } }`
const MyComponentWithData = graphql(MyQuery)(MyComponent)

const MyMutation = gql`mutation MySimpleMutation { doSomething }`
const MyComponentWithMutation = graphql(MyMutation)(MyComponent)

render(
  <ApolloProvider client={client}>
    <MyComponentWithData />
  </ApolloProvider>,
  document.getElementById('root')
)