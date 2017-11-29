const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(common, {
    devtool: '',
    plugins: [
        new UglifyJSPlugin({
            sourceMap: false
        }),
    ]
});