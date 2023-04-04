const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require('path');

module.exports = {
  entry: "./src/index.ts",
  output:{
    library: 'chatbot',
    path: __dirname + '/dist',
    libraryTarget: 'umd',
    filename: '[name].js',
    chunkFilename: "[id].js",
  },
  mode: "development",
  devServer: {
    compress: true,
    open: true,
  },
  devtool: "inline-source-map",
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
    }),
  ],
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        include: __dirname + '/src',
        loader: 'babel-loader',
        options: {
          presets: ['@babel/typescript', '@babel/preset-env'],
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'raw-loader',
          {
            loader:'sass-loader',
            options: {
              sassOptions:{
                includePaths: [path.resolve(__dirname, 'node_modules')]
              }
            }
          }
        ],
      },
    ],
  },
  optimization: {
    runtimeChunk: 'single',
  },
};
