# Setup

## Installation

```bash
npm init
npm install webpack webpack-dev-server babel-cli babel-core babel-loader babel-preset-es2015 babel-preset-react react react-dom apollo-client react-apollo --save-dev
```

## Minimum React implementation

```javascript
import React from 'react'
import { render } from 'react-dom'
import { ApolloProvider, ApolloClient, createNetworkInterface } from 'react-apollo'
import { gql, graphql } from 'react-apollo'

const MyComponent = props => (<pre>{JSON.strinigy(props, null, 4)}</pre>)
const MyQuery = gql`query MySimpleQuery { search(term: "some example content") { content } }`
const MyComponentWithData = graphql(MyQuery)(MyComponent)

render(
  <ApolloProvider client={client}>
    <MyComponentWithData />
  </ApolloProvider>,
  document.getElementById('root')
)
```

## Run application for development

```bash
webpack-dev-server -d --hot --inline --no-info --port 9090
```

## Build application

```bash
webpack -p
```