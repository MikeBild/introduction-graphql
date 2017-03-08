const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack');
const dotenv = require('dotenv').config({path:'.env-production'});

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: './src/app.js',
  output: {
    path: 'build/',
    publicPath: '/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.css/,
      loader: 'style!css'
    }, {
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
    'process.env': {
        MODE: JSON.stringify(process.env.NODE_ENV),
        VERSION: JSON.stringify(require('./package.json').version),
        GRAPHQL_HOST: JSON.stringify(process.env.GRAPHQL_HOST),
      },
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
    new webpack.optimize.CommonsChunkPlugin('common.js'),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.AggressiveMergingPlugin()
  ]
}
