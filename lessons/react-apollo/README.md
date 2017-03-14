# React + Apollo Client

## Install dependencies for this lesson

```bash
npm install webpack babel-core babel-loader babel-preset-es2015 babel-preset-stage-0 babel-preset-react react react-dom apollo-client react-apollo
npm install -g babel-cli babel-core webpack webpack-dev-server
```

## Implementation

```bash
touch index.html
touch app.js
touch .babelrc
touch webpack.config.js
```

## Run application for development

```bash
webpack-dev-server -d --hot --inline --no-info --port 9090
```

## Build application

```bash
webpack -p
```