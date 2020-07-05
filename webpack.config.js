const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/scripts/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.(json|md|rs|svg)$/i,
        use: 'raw-loader',
      },
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  // devServer: {
  //     contentBase: path.join(__dirname, 'dist'),
  //     port: 7200,
  // },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};
