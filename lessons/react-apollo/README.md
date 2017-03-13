# React + Apollo Client

## Install dependencies for this lesson

```bash
npm install webpack babel-core babel-loader babel-preset-es2015 babel-preset-react react react-dom apollo-client react-apollo graphql-tag
npm install -g babel-cli babel-core webpack webpack-dev-server
```

## Implementation

```bash
touch index.html
touch app.js
touch .babelrc
touch webpack.config.js
```

## Run

```bash
webpack-dev-server -d --hot --inline --no-info --port 9090
```

## Build

```bash
webpack -p
```