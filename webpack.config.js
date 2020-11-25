const Dotenv = require('dotenv-webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    background: path.resolve(__dirname, 'src/background.ts'),
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    symlinks: false,
    alias: {
      path: 'path-browserify',
    }    
  },  
  devtool: 'inline-source-map',    
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],    
  },
  output: {
    path: path.resolve(__dirname, 'build'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json'},
        { from: 'images', to: 'images'},
      ]
    }),
    new Dotenv(),    
  ], 
}