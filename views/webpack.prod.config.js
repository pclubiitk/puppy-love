var webpack = require('webpack');
// Webpack Plugins
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var webpackMerge = require('webpack-merge'); // used to merge webpack configs
var commonConfig = require('./webpack.config.js'); // the settings that are common to prod and dev

module.exports = webpackMerge(commonConfig, {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'ENV': JSON.stringify('production')
      }
    }),
    new UglifyJsPlugin()
  ]
});
