# Application Structure

```bash
.
├── build
├── src
├── package.json
├── webpack.config.js
└── webpack.production.config.js
```

## `src` folder

```bash
.
├── components
├── pages
├── app.js
├── index.html
└── style.css
```

## `package.json`

```json
"scripts": {
  "dev": "webpack-dev-server -d --hot --inline --no-info --port 9090",
  "build": "webpack -p --config ./webpack.production.config.js"
},
"babel": {
  "presets": [
    "es2015",
    "react",
    "stage-0"
  ]
},
```

## `webpack.config.js`

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: './src/app.js',
  output: {
    path: 'build/',
    publicPath: '/',
    filename: 'bundle.js',
  },
  devServer: {
    historyApiFallback: true,
  },
  module: {
    loaders: [
      {
        test: /\.css/,
        loader: 'style!css',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
        VERSION: JSON.stringify(require('./package.json').version),
        GRAPHQL_HOST: JSON.stringify('http:://localhost:8787/graphql'),
      },
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
    new webpack.optimize.CommonsChunkPlugin('common.js'),
    new webpack.optimize.DedupePlugin(),
  ],
};
```
