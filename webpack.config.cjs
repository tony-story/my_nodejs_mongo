const path = require('path');
// import * as path from "path";
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './server.js',  // 入口文件，替换为你的实际入口文件
    target: 'node',  // 设置 Node.js 环境
    externals: [nodeExternals()],  // 排除 Node.js 的外部依赖
    output: {
        path: path.resolve(__dirname, 'dist'),  // 输出目录
        filename: 'bundle.js',  // 输出文件名
        libraryTarget: 'commonjs2',  // 打包为 commonjs2 模块
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader',  // 使用 Babel 进行编译
            },
        ],
    },
    resolve: {
        extensions: ['.js'],
    },
};
